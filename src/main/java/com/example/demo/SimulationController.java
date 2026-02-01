package com.example.demo;

import org.springframework.web.bind.annotation.*;
import java.util.ArrayList;
import java.util.List;

@RestController
@CrossOrigin(origins = "*")
@RequestMapping("/api/simulation")
public class SimulationController {

    @PostMapping("/run")
    public SimulationResult runSimulation(@RequestBody SimulationRequest request) {
        List<SimulationResult.DataPoint> data = new ArrayList<>();
        double currentY = 10.0;
        
        for (int i = 0; i <= request.getIterations(); i++) {
            data.add(new SimulationResult.DataPoint(i, currentY));
            currentY += Math.random() * request.getGrowthFactor();
        }

        return new SimulationResult("Success", data);
    }

    @GetMapping("/health")
    public String health() {
        return "Simulator Backend is running";
    }
}
