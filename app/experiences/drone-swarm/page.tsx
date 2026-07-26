import type { Metadata } from "next"

import DroneSwarm from "@/components/experiences/drone-swarm/drone-swarm"

export const metadata: Metadata = {
  title: "Swarm Intel — Intelligence collective | SorokDva Labs",
  description:
    "Un essaim de drones lumineux à guider et à recomposer directement dans le navigateur.",
}

export default function DroneSwarmPage() {
  return <DroneSwarm />
}
