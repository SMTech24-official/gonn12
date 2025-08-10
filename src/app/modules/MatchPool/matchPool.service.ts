import { GenderType, SessionQueueParticipant, TeamName } from "@prisma/client"
import ApiError from "../../../errors/ApiErrors"
import prisma from "../../../shared/prisma"

const POWER_MAP = {
  CASUAL: 50,
  BEGINNER: 60,
  INTERMEDIATE: 80,
  ADVANCED: 90,
}

const addToMatchPool = async (
  matchpoolId: string,
  sessionQueueParticipantId: string,
  teamName: TeamName
) => {
  const matchPool = await prisma.matchPool.findUnique({
    where: { id: matchpoolId },
    include: { session: true, matchPoolParticipants: true },
  })
  if (!matchPool) throw new ApiError(400, "MatchPool not found")

  const sessionQueueParticipant =
    await prisma.sessionQueueParticipant.findUnique({
      where: { id: sessionQueueParticipantId },
      include: { member: true },
    })
  if (!sessionQueueParticipant)
    throw new ApiError(400, "SessionQueueParticipant not found")

  const existingParticipants = await prisma.matchPoolParticipant.findMany({
    where: {
      matchPoolId: matchpoolId,
      memberId: sessionQueueParticipant.memberId,
      teamName,
    },
  })
  if (existingParticipants.length === 2) {
    throw new ApiError(400, "Participants already exist in match pool")
  }

  const sessionQueue = await prisma.sessionQueue.findUnique({
    where: { sessionId: matchPool.sessionId },
  })
  if (!sessionQueue) throw new ApiError(400, "SessionQueue not found")

  const matchPoolParticipant = await prisma.$transaction(async (prisma) => {
    const created = await prisma.matchPoolParticipant.create({
      data: {
        matchPoolId: matchpoolId,
        memberId: sessionQueueParticipant.memberId,
        teamName,
      },
      include: { member: true, matchPool: true },
    })

    await prisma.sessionQueueParticipant.delete({
      where: { id: sessionQueueParticipant.id },
    })

    return created
  })

  return matchPoolParticipant
}

const removeFromMatchPool = async (matchPoolParticipantId: string) => {
  const matchPoolParticipant = await prisma.matchPoolParticipant.findUnique({
    where: { id: matchPoolParticipantId },
    include: { matchPool: { include: { session: true } } },
  })
  if (!matchPoolParticipant)
    throw new ApiError(400, "MatchPoolParticipant not found")

  await prisma.matchPoolParticipant.delete({
    where: { id: matchPoolParticipantId },
  })

  await prisma.sessionQueueParticipant.create({
    data: {
      sessionQueueId: matchPoolParticipant.matchPool.sessionId,
      memberId: matchPoolParticipant.memberId,
    },
  })

  return { message: "MatchPoolParticipant removed successfully" }
}

export const generateMatchPool = async (
  sessionId: string,
  genderType: GenderType = GenderType.MIXED
) => {
  // 1. Get session & queue
  const session = await prisma.session.findUnique({
    where: { id: sessionId },
    include: { MatchPool: true },
  })
  if (!session) throw new ApiError(400, "Session not found")

  const sessionQueue = await prisma.sessionQueue.findUnique({
    where: { sessionId: session.id },
  })
  if (!sessionQueue) throw new ApiError(400, "SessionQueue not found")

  // 2. Get participants
  const allParticipants = await prisma.sessionQueueParticipant.findMany({
    where: { sessionQueueId: sessionQueue.id },
    include: { member: true },
    orderBy: { createdAt: "asc" },
  })

  if (!allParticipants || allParticipants.length < 4) {
    throw new ApiError(400, "Not enough players to generate a match")
  }

  // 3. Filter by gender
  let participants = allParticipants
  if (genderType === GenderType.MALE || genderType === GenderType.FEMALE) {
    participants = allParticipants.filter(
      (p) => p.member?.gender === genderType
    )
  }
  if (participants.length < 4) {
    throw new ApiError(400, "Not enough players to form a match")
  }

  // 4. Take up to first 8 participants
  const scope = participants.slice(0, Math.min(8, participants.length))

  // 5. Load previous matches
  const previousMatches = await prisma.match.findMany({
    where: { sessionId: session.id },
    select: { Participant: { select: { memberId: true } } },
  })

  const playedSet = new Set(
    previousMatches.map((m) =>
      m.Participant.map((p) => p.memberId)
        .sort()
        .join("-")
    )
  )

  // 6. Generate all possible combos
  const allCombos: Array<(typeof scope)[number][]> = []
  for (let i = 0; i < scope.length; i++) {
    for (let j = i + 1; j < scope.length; j++) {
      for (let k = j + 1; k < scope.length; k++) {
        for (let l = k + 1; l < scope.length; l++) {
          allCombos.push([scope[i], scope[j], scope[k], scope[l]])
        }
      }
    }
  }

  // 6.1 Separate into new combos vs repeats
  const newCombos = allCombos.filter((group) => {
    const ids = group
      .map((p) => p.member.id)
      .sort()
      .join("-")
    return !playedSet.has(ids)
  })

  // 7. Function to pick best balanced group
  const pickBestGroup = (combos: typeof allCombos) => {
    let bestGroup: typeof scope = []
    let bestDiff = Infinity

    for (const group of combos) {
      const teamOptions = [
        [
          [0, 1],
          [2, 3],
        ],
        [
          [0, 2],
          [1, 3],
        ],
        [
          [0, 3],
          [1, 2],
        ],
      ]

      for (const [teamAIdx, teamBIdx] of teamOptions) {
        const powerOf = (p: (typeof group)[0]) =>
          POWER_MAP[p.member?.level ?? "CASUAL"]

        const powerA = powerOf(group[teamAIdx[0]]) + powerOf(group[teamAIdx[1]])
        const powerB = powerOf(group[teamBIdx[0]]) + powerOf(group[teamBIdx[1]])
        const diff = Math.abs(powerA - powerB)

        if (diff < bestDiff) {
          bestDiff = diff
          bestGroup = group
        }
      }
    }
    return { bestGroup, bestDiff }
  }

  // 8. Try new combos first
  let { bestGroup, bestDiff } = pickBestGroup(newCombos)

  // If no new combos or balance too bad, allow repeats
  const BALANCE_THRESHOLD = 3 // can adjust
  if (!bestGroup.length || bestDiff > BALANCE_THRESHOLD) {
    ;({ bestGroup, bestDiff } = pickBestGroup(allCombos))
  }

  if (!bestGroup.length) {
    throw new ApiError(400, "Could not form any match")
  }

  // 9. Create match
  await createBalancedMatch(session.id, bestGroup)

  return
}

const createBalancedMatch = async (
  sessionId: string,
  participants: (SessionQueueParticipant & {
    member: { level: keyof typeof POWER_MAP } | null
  })[]
) => {
  if (participants.length !== 4) return

  const powerOf = (
    p: SessionQueueParticipant & {
      member: { level: keyof typeof POWER_MAP } | null
    }
  ) => {
    const level =
      p.member?.level && POWER_MAP[p.member.level] !== undefined
        ? p.member.level
        : "CASUAL"
    return POWER_MAP[level]
  }

  const combos = [
    [
      [0, 1],
      [2, 3],
    ],
    [
      [0, 2],
      [1, 3],
    ],
    [
      [0, 3],
      [1, 2],
    ],
  ]

  let bestDiff = Infinity
  let bestTeams: number[][] = []

  for (const [teamAIdx, teamBIdx] of combos) {
    const teamA = teamAIdx.map((i) => participants[i])
    const teamB = teamBIdx.map((i) => participants[i])

    const powerA = teamA.reduce((acc, p) => acc + powerOf(p), 0)
    const powerB = teamB.reduce((acc, p) => acc + powerOf(p), 0)

    const diff = Math.abs(powerA - powerB)
    if (diff < bestDiff) {
      bestDiff = diff
      bestTeams = [teamAIdx, teamBIdx]
    }
  }

  const matchPool = await prisma.matchPool.create({
    data: { sessionId },
  })

  const [teamAIdx, teamBIdx] = bestTeams
  for (const idx of teamAIdx) {
    console.log(`Adding participant ${participants[idx].id} to Team A`)
    await addToMatchPool(matchPool.id, participants[idx].id, TeamName.TEAM_A)
  }
  for (const idx of teamBIdx) {
    console.log(`Adding participant ${participants[idx].id} to Team B`)
    await addToMatchPool(matchPool.id, participants[idx].id, TeamName.TEAM_B)
  }

  return {
    matchPoolId: matchPool.id,
    participants: participants.map((p) => p.id),
    teams: {
      teamA: teamAIdx.map((i) => participants[i].id),
      teamB: teamBIdx.map((i) => participants[i].id),
    },
  }
}

const getAllMatchPools = async (query: any) => {
  const { page = 1, limit = 10, sessionId } = query
  const skip = (Number(page) - 1) * Number(limit)
  const take = Number(limit)

  const whereConditions: any = {}
  if (sessionId) {
    whereConditions.sessionId = sessionId
  }
  const totalCount = await prisma.matchPool.count({
    where: whereConditions,
  })
  const matchPools = await prisma.matchPool.findMany({
    skip,
    take,
    where: whereConditions,
    include: {
      matchPoolParticipants: {
        include: { member: true },
      },
      session: true,
    },
  })
  return {
    meta: {
      totalCount,
      page,
      limit,
    },
    data: matchPools,
  }
}

const getMatchPoolById = async (id: string) => {
  const matchPool = await prisma.matchPool.findUnique({
    where: { id },
    include: {
      matchPoolParticipants: {
        include: { member: true },
      },
      session: true,
    },
  })
  if (!matchPool) throw new ApiError(400, "MatchPool not found")
  return matchPool
}

const createSessionMatch = async (
  matchPoolId: string,
  sessionCourtId: string
) => {
  const matchPool = await prisma.matchPool.findUnique({
    where: { id: matchPoolId },
    include: {
      matchPoolParticipants: {
        include: { member: true },
      },
      session: true,
    },
  })
  if (!matchPool) throw new ApiError(400, "MatchPool not found")

  if (matchPool.matchPoolParticipants.length < 4) {
    throw new ApiError(400, "Not enough participants in MatchPool")
  }

  const sessionCourt = await prisma.sessionCourt.findUnique({
    where: { id: sessionCourtId, isBooked: false },
  })

  if (!sessionCourt) throw new ApiError(400, "SessionCourt not found")

  if (matchPool.sessionId !== sessionCourt.sessionId) {
    throw new ApiError(
      400,
      "SessionCourt does not belong to the MatchPool's session"
    )
  }

  const match = await prisma.$transaction(async (prisma) => {
    const match = await prisma.match.create({
      data: {
        sessionId: matchPool.sessionId,
        courtId: sessionCourt.courtId,
        clubId: matchPool.session.clubId,
        startTime: new Date(),
        endTime: new Date(Date.now() + 60 * 60 * 1000), // 1 hour later
      },
    })

    await prisma.matchParticipant.createMany({
      data: matchPool.matchPoolParticipants.map((participant) => ({
        matchId: match.id,
        memberId: participant.memberId,
        teamName: participant.teamName,
      })),
    })

    await prisma.matchPool.delete({
      where: { id: matchPool.id },
    })

    await prisma.sessionCourt.update({
      where: { id: sessionCourtId },
      data: { isBooked: true },
    })

    return match
  })

  return match
}

export const MatchPoolServices = {
  addToMatchPool,
  removeFromMatchPool,
  getMatchPoolById,
  getAllMatchPools,
  generateMatchPool,
  createSessionMatch,
}
