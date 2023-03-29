import * as React from 'react'
import CircularProgress from '@mui/material/CircularProgress'
import Box from '@mui/material/Box'
import { usePromiseTracker } from 'react-promise-tracker'

export default function Spinner(props: any) {
  const { promiseInProgress } = usePromiseTracker({ area: props.area })

  return promiseInProgress ? (
    <Box sx={{ display: 'flex', align: 'center' }}>
      <CircularProgress />
    </Box>
  ) : null
}
