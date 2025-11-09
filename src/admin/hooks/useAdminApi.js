// frontend/src/admin/hooks/useAdminApi.js
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { adminApiFetch } from '../api/client.js'
import { useAdminAuth } from '../context/AdminAuthContext.jsx'

export const useAdminQuery = (key, path, options = {}) => {
  const { token } = useAdminAuth()
  return useQuery({
    queryKey: key,
    queryFn: () => adminApiFetch(typeof path === 'function' ? path() : path, { token }),
    ...options
  })
}

export const useAdminMutation = (path, { method = 'POST', invalidate = [] } = {}) => {
  const { token } = useAdminAuth()
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (body) => {
      const url = typeof path === 'function' ? path(body) : path
      const verb = typeof method === 'function' ? method(body) : method
      const payload = verb === 'GET' ? undefined : body
      return adminApiFetch(url, { token, method: verb, body: payload })
    },
    onSuccess: () => {
      invalidate.forEach(key => qc.invalidateQueries({ queryKey: key }))
    }
  })
}
