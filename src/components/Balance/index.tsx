import * as React from 'react';
import Link from '@mui/material/Link';
import Typography from '@mui/material/Typography';
import Title from '../Title';

function preventDefault(event: React.MouseEvent) {
  event.preventDefault()
}
export default function Balance(props: any) {
  const curr = new Date()
  const today = curr.toISOString().substr(0, 10)
  return (
    <React.Fragment>
      <Title>{props.title}</Title>
      <Typography component='p' variant='h4'>
        $
        {props.amount.toLocaleString(undefined, {
          maximumFractionDigits: 2,
          minimumFractionDigits: 2,
        })}
      </Typography>
      <Typography
        color='text.secondary'
        sx={{ flex: 1, display: 'flex', alignItems: 'flex-end' }}
      >
        on {today}
      </Typography>
    </React.Fragment>
  )
}