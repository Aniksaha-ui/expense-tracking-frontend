import { useEffect, useState } from 'react'
import { useToast } from '../components/common/Toaster'

export default function useDropdownOptions(fetcher, mapOption) {
  const toast = useToast()
  const [options, setOptions] = useState([])

  useEffect(() => {
    let active = true

    fetcher()
      .then((rows) => {
        if (active) {
          setOptions(rows.map(mapOption))
        }
      })
      .catch((error) => {
        toast.error(error.message || 'Unable to load dropdown options.')
      })

    return () => {
      active = false
    }
  }, [fetcher, mapOption, toast])

  return options
}
