import freelancersData from "./data/freelancers.json"
import worklogsData from "./data/worklogs.json"
import entriesData from "./data/entries.json"

export const getFreelancers = () => freelancersData

export const getFreelancerById = (id: string) =>
  freelancersData.find((f) => f.id === id)

export const getWorklogs = () => worklogsData

export const getWorklogById = (id: string) =>
  worklogsData.find((w) => w.id === id)

export const getEntries = () => entriesData

export const getEntriesByWorklogId = (worklogId: string) =>
  entriesData.filter((e) => e.worklogId === worklogId)

export const getWorklogsByDateRange = (start?: string, end?: string) => {
  return worklogsData.filter((w) => {
    const createdAt = new Date(w.createdAt)
    if (start && end) {
      return createdAt >= new Date(start) && createdAt <= new Date(end)
    }
    if (start) {
      return createdAt >= new Date(start)
    }
    if (end) {
      return createdAt <= new Date(end)
    }
    return true
  })
}

export const getTotalEarnings = (worklogId: string) => {
  const entries = getEntriesByWorklogId(worklogId)
  const worklog = getWorklogById(worklogId)
  if (!worklog) return 0
  const freelancer = getFreelancerById(worklog.freelancerId)
  if (!freelancer) return 0
  return entries.reduce((sum, e) => sum + e.hours * freelancer.hourlyRate, 0)
}

export const getWorklogsWithEarnings = () => {
  return worklogsData.map((w) => ({
    ...w,
    totalEarnings: getTotalEarnings(w.id),
    freelancer: getFreelancerById(w.freelancerId),
  }))
}

export const getWorklogsByDateRangeWithEarnings = (start?: string, end?: string) => {
  const filtered = getWorklogsByDateRange(start, end)
  return filtered.map((w) => ({
    ...w,
    totalEarnings: getTotalEarnings(w.id),
    freelancer: getFreelancerById(w.freelancerId),
  }))
}

export const getApprovedWorklogs = (): string[] => {
  return JSON.parse(localStorage.getItem("approvedWorklogs") || "[]")
}

export const isWorklogApproved = (worklogId: string): boolean => {
  return getApprovedWorklogs().includes(worklogId)
}

export const setWorklogApproved = (worklogId: string, approved: boolean) => {
  const approvedWorklogs = getApprovedWorklogs()
  if (approved) {
    if (!approvedWorklogs.includes(worklogId)) {
      approvedWorklogs.push(worklogId)
    }
  } else {
    const index = approvedWorklogs.indexOf(worklogId)
    if (index > -1) {
      approvedWorklogs.splice(index, 1)
    }
  }
  localStorage.setItem("approvedWorklogs", JSON.stringify(approvedWorklogs))
}
