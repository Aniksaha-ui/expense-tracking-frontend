import { useEffect, useState } from 'react'
import { useToast } from '../../../components/common/Toaster'
import { getDashboardOverview } from '../service/dashboardService'

export default function useDashboard() {
  const toast = useToast()
  const [state, setState] = useState({
    data: null,
    error: null,
    isLoading: true,
  })

  useEffect(() => {
    let active = true

    getDashboardOverview()
      .then((data) => {
        if (active) {
          setState({ data, error: null, isLoading: false })
        }
      })
      .catch((error) => {
        if (active) {
          setState((currentState) => ({
            data: currentState.data,
            error: error.message || 'Unable to load dashboard data.',
            isLoading: false,
          }))
          toast.error(error.message || 'Unable to load dashboard data.')
        }
      })

    return () => {
      active = false
    }
  }, [toast])

  return state
}
