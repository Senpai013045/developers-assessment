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

export const getWorklogsByDateRange = (start: string, end: string) => {
  const startDate = new Date(start)
  const endDate = new Date(end)
  return worklogsData.filter((w) => {
    const createdAt = new Date(w.createdAt)
    return createdAt >= startDate && createdAt <= endDate
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
