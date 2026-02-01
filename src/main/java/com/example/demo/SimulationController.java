package com.example.demo;

import org.springframework.web.bind.annotation.*;
import java.util.ArrayList;
import java.util.List;
import java.util.Random;

@RestController
@CrossOrigin(origins = "*")
@RequestMapping("/api/simulation")
public class SimulationController {

    private static final double WORLD_SIZE = 500.0;
    private static final double INFECTION_RADIUS = 15.0;

    @PostMapping("/run")
    public SimulationResult runSimulation(@RequestBody SimulationRequest request) {
        List<Agent> agents = initializeAgents(request.getPopulationSize());
        List<SimulationResult.Frame> frames = new ArrayList<>();
        List<SimulationResult.Stats> stats = new ArrayList<>();
        Random random = new Random();

        // Run simulation steps
        for (int t = 0; t < request.getDuration(); t++) {
            // 1. Move Agents
            for (Agent agent : agents) {
                moveAgent(agent, request.getMovementSpeed(), random);
            }

            // 2. Infection Spread
            // Naive O(N^2) for simplicity - acceptable for small populationSize (< 500)
            for (Agent a : agents) {
                if (a.status == 1) { // Infected
                    for (Agent neighbor : agents) {
                        if (neighbor.status == 0) { // Susceptible
                            double dist = Math.sqrt(Math.pow(a.x - neighbor.x, 2) + Math.pow(a.y - neighbor.y, 2));
                            if (dist < INFECTION_RADIUS) {
                                if (random.nextDouble() < request.getTransmissionRate()) {
                                    neighbor.nextStatus = 1; // Mark for infection next step
                                }
                            }
                        }
                    }
                    // Recovery chance
                    if (random.nextDouble() < request.getRecoveryRate()) {
                        a.nextStatus = 2;
                    }
                }
            }

            // 3. Update Status and Record Stats
            int countS = 0, countI = 0, countR = 0;
            List<SimulationResult.AgentState> frameAgents = new ArrayList<>();
            
            for (Agent agent : agents) {
                if (agent.nextStatus != -1) {
                    agent.status = agent.nextStatus;
                    agent.nextStatus = -1;
                }
                
                if (agent.status == 0) countS++;
                else if (agent.status == 1) countI++;
                else countR++;

                frameAgents.add(new SimulationResult.AgentState(agent.x, agent.y, agent.status));
            }

            frames.add(new SimulationResult.Frame(t, frameAgents));
            stats.add(new SimulationResult.Stats(t, countS, countI, countR));
        }

        return new SimulationResult("Success", frames, stats);
    }

    private List<Agent> initializeAgents(int count) {
        List<Agent> agents = new ArrayList<>();
        Random random = new Random();
        for (int i = 0; i < count; i++) {
            double x = random.nextDouble() * WORLD_SIZE;
            double y = random.nextDouble() * WORLD_SIZE;
            // First 3 agents are infected
            int status = (i < 3) ? 1 : 0;
            agents.add(new Agent(x, y, status));
        }
        return agents;
    }

    private void moveAgent(Agent agent, double speed, Random random) {
        double angle = random.nextDouble() * 2 * Math.PI;
        agent.x += Math.cos(angle) * speed;
        agent.y += Math.sin(angle) * speed;

        // Bounce off walls
        if (agent.x < 0) agent.x = 0;
        if (agent.x > WORLD_SIZE) agent.x = WORLD_SIZE;
        if (agent.y < 0) agent.y = 0;
        if (agent.y > WORLD_SIZE) agent.y = WORLD_SIZE;
    }

    // Internal Agent Helper Class
    private static class Agent {
        double x, y;
        int status; // 0: S, 1: I, 2: R
        int nextStatus = -1;

        public Agent(double x, double y, int status) {
            this.x = x;
            this.y = y;
            this.status = status;
        }
    }
    
    @GetMapping("/health")
    public String health() {
        return "SIR Simulator Backend is running";
    }
}