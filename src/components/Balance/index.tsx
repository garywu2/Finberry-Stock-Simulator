import * as React from 'react';
import Link from '@mui/material/Link';
import Typography from '@mui/material/Typography';
import Title from '../Title';

function preventDefault(event: React.MouseEvent) {
    event.preventDefault();
}

export default function Balance() {
    const curr = new Date();
    const today = curr.toISOString().substr(0, 10);
    return (
        <React.Fragment>
            <Title>Portfolio Balance</Title>
            <Typography component="p" variant="h4">
                $3,420,712.00
            </Typography>
            <Typography color="text.secondary" sx={{ flex: 1 }}>
                on {today}
            </Typography>
            <div>
                <Link color="primary" href="#" onClick={preventDefault}>
                    View holdings
                </Link>
            </div>
        </React.Fragment>
    );
}