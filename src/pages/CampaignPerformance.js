import "./CampaignPerformance.css";
import React from "react";
import { Bar, Line } from "react-chartjs-2";
import {
    Card,
    CardContent,
    Typography,
    Grid,
    Box,
    IconButton,
} from "@mui/material";
import Header from "../components/Header";
import Sidebar from "../components/Sidebar";
import { AccessTime, Visibility, ThumbUp, Share } from "@mui/icons-material";
import { Chart as ChartJS, registerables } from "chart.js";
ChartJS.register(...registerables);

const CampaignPerformance = () => {
    // Sample data for charts
    const performanceData = {
        labels: ["Facebook", "Instagram", "YouTube"],
        datasets: [
            {
                label: "Views",
                data: [5000, 8000, 15000],
                backgroundColor: ["#3b5998", "#8a3ab9", "#FF0000"],
                borderColor: ["#3b5998", "#8a3ab9", "#FF0000"],
                borderWidth: 1,
            },
        ],
    };

    const engagementData = {
        labels: ["Week 1", "Week 2", "Week 3", "Week 4"],
        datasets: [
            {
                label: "Engagement",
                data: [100, 150, 200, 250],
                borderColor: "#4caf50",
                backgroundColor: "rgba(76, 175, 80, 0.2)",
                tension: 0.4,
                fill: true,
            },
        ],
    };

    return (
        <>
        <Header />
        <div className="splitter">
            <Sidebar />
            <div style={{ padding: "20px" }} className="container">
                <Typography variant="h4" gutterBottom>
                    Campaign Performance Dashboard
                </Typography>

                {/* Performance Metrics */}
                <Grid container spacing={3}>
                    <Grid item xs={12} sm={6} md={3}>
                        <Card>
                            <CardContent>
                                <Typography variant="h6" gutterBottom>
                                    Total Views
                                </Typography>
                                <Box display="flex" alignItems="center">
                                    <Visibility style={{ color: "#3b5998", marginRight: "8px" }} />
                                    <Typography variant="h5">28,000</Typography>
                                </Box>
                            </CardContent>
                        </Card>
                    </Grid>
                    <Grid item xs={12} sm={6} md={3}>
                        <Card>
                            <CardContent>
                                <Typography variant="h6" gutterBottom>
                                    Likes
                                </Typography>
                                <Box display="flex" alignItems="center">
                                    <ThumbUp style={{ color: "#8a3ab9", marginRight: "8px" }} />
                                    <Typography variant="h5">1,800</Typography>
                                </Box>
                            </CardContent>
                        </Card>
                    </Grid>
                    <Grid item xs={12} sm={6} md={3}>
                        <Card>
                            <CardContent>
                                <Typography variant="h6" gutterBottom>
                                    Shares
                                </Typography>
                                <Box display="flex" alignItems="center">
                                    <Share style={{ color: "#FF0000", marginRight: "8px" }} />
                                    <Typography variant="h5">400</Typography>
                                </Box>
                            </CardContent>
                        </Card>
                    </Grid>
                    <Grid item xs={12} sm={6} md={3}>
                        <Card>
                            <CardContent>
                                <Typography variant="h6" gutterBottom>
                                    Average Time Spent
                                </Typography>
                                <Box display="flex" alignItems="center">
                                    <AccessTime style={{ color: "#ff9800", marginRight: "8px" }} />
                                    <Typography variant="h5">3 mins</Typography>
                                </Box>
                            </CardContent>
                        </Card>
                    </Grid>
                </Grid>

                {/* Charts */}
                <Grid container spacing={3} style={{ marginTop: "20px" }}>
                    <Grid item xs={12} md={6}>
                        <Card>
                            <CardContent>
                                <Typography variant="h6" gutterBottom>
                                    Views by Platform
                                </Typography>
                                <Bar data={performanceData} />
                            </CardContent>
                        </Card>
                    </Grid>
                    <Grid item xs={12} md={6}>
                        <Card>
                            <CardContent>
                                <Typography variant="h6" gutterBottom>
                                    Weekly Engagement
                                </Typography>
                                <Line data={engagementData} />
                            </CardContent>
                        </Card>
                    </Grid>
                </Grid>

                {/* Recent Campaigns */}
                <Typography variant="h5" style={{ marginTop: "30px" }}>
                    Recent Campaigns
                </Typography>
                <Grid container spacing={3} style={{ marginTop: "10px" }}>
                    <Grid item xs={12} md={4}>
                        <Card>
                            <CardContent>
                                <Typography variant="h6" gutterBottom>
                                    Campaign: Spring Fest 2024
                                </Typography>
                                <Typography variant="body2">Platform: Facebook</Typography>
                                <Typography variant="body2">Engagement: 5,000</Typography>
                                <Typography variant="body2">Reach: 10,000</Typography>
                            </CardContent>
                        </Card>
                    </Grid>
                    <Grid item xs={12} md={4}>
                        <Card>
                            <CardContent>
                                <Typography variant="h6" gutterBottom>
                                    Campaign: Music Night
                                </Typography>
                                <Typography variant="body2">Platform: Instagram</Typography>
                                <Typography variant="body2">Engagement: 8,000</Typography>
                                <Typography variant="body2">Reach: 15,000</Typography>
                            </CardContent>
                        </Card>
                    </Grid>
                    <Grid item xs={12} md={4}>
                        <Card>
                            <CardContent>
                                <Typography variant="h6" gutterBottom>
                                    Campaign: Tech Talk
                                </Typography>
                                <Typography variant="body2">Platform: YouTube</Typography>
                                <Typography variant="body2">Engagement: 15,000</Typography>
                                <Typography variant="body2">Reach: 20,000</Typography>
                            </CardContent>
                        </Card>
                    </Grid>
                </Grid>
            </div>
        </div>
        </>
    );
};

export default CampaignPerformance;
