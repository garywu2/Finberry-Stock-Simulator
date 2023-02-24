import * as React from 'react';
import { useTheme } from '@mui/material/styles';
import { LineChart, Line, XAxis, YAxis, Label, ResponsiveContainer, CartesianGrid } from 'recharts';
import Title from '../Title';


const Chart = (data: any | undefined) => {
    const theme = useTheme();

    return (
        <React.Fragment>
            <Title>Today</Title>
            <ResponsiveContainer height="100%" width="100%">
                <LineChart
                    data={data.data}
                    margin={{
                        top: 16,
                        right: 16,
                        bottom: 0,
                        left: 24,
                    }}
                >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis
                        dataKey="date"
                        stroke={'black'}
                        style={theme.typography.body2}
                    />
                    <YAxis
                        stroke={'black'}
                        style={theme.typography.body2}
                    >
                        <Label
                            angle={270}
                            position="left"
                            style={{
                                textAnchor: 'middle',
                                fill: theme.palette.text.primary,
                                ...theme.typography.body1,
                            }}
                        >
                            Value ($)
                        </Label>
                    </YAxis>
                    <Line
                        isAnimationActive={true}
                        type="monotone"
                        dataKey="price"
                        stroke={theme.palette.secondary.main}
                        dot={false}
                    />
                </LineChart>
            </ResponsiveContainer>
        </React.Fragment>
    );
}
export default Chart;