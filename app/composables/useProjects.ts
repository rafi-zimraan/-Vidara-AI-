interface Project {
  id: string
  title: string
  description?: string
  status: string
  language: string
  target_duration_secs?: number
  target_duration_seconds?: number
  aspect_ratio: string
  resolution: string
  created_at: string
  updated_at: string
  completed_at?: string
  youtube_url?: string
}

export const useProjects = () => {
  const { get, post, patch, del } = useApi()

  const projects = useState<Project[]>('projects', () => [])
  const loading = useState('projects-loading', () => false)

  async function fetchProjects(status?: string) {
    loading.value = true
    try {
      const query = status ? { status } : undefined
      const data = await get<Project[]>('/api/projects', query)
      projects.value = data || []
      return data
    } finally {
      loading.value = false
    }
  }

  async function createProject(body: Partial<Project>) {
    const data = await post<Project>('/api/projects', body)
    projects.value = [data, ...projects.value]
    return data
  }

  async function getProject(id: string) {
    return get<Project>(`/api/projects/${id}`)
  }

  async function updateProject(id: string, body: Partial<Project>) {
    const data = await patch<Project>(`/api/projects/${id}`, body)
    projects.value = projects.value.map(p => (p.id === id ? { ...p, ...data } : p))
    return data
  }

  async function deleteProject(id: string) {
    await del(`/api/projects/${id}`)
    projects.value = projects.value.filter(p => p.id !== id)
  }

  return { projects, loading, fetchProjects, createProject, getProject, updateProject, deleteProject }
}
