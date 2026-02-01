package com.example.demo;

import java.util.List;

public class SimulationResult {
    private String status;
    private List<DataPoint> data;

    public SimulationResult(String status, List<DataPoint> data) {
        this.status = status;
        this.data = data;
    }

    public String getStatus() { return status; }
    public List<DataPoint> getData() { return data; }

    public static class DataPoint {
        private int x;
        private double y;

        public DataPoint(int x, double y) {
            this.x = x;
            this.y = y;
        }

        public int getX() { return x; }
        public double getY() { return y; }
    }
}
