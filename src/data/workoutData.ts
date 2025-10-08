export interface Exercise {
  id: string;
  name: string;
  sets: string;
  reps: string;
  notes?: string;
  videoUrl?: string;
  activationSteps?: string[];
}

export interface DayWorkout {
  title: string;
  exercises: Exercise[];
}

export interface WorkoutPlan {
  [day: string]: DayWorkout;
}

export interface LevelWorkouts {
  [level: string]: WorkoutPlan;
}

export const workoutData: LevelWorkouts = {
  "Level 1": {
    Monday: {
      title: "BOOTY",
      exercises: [
        {
          id: "l1-mon-1",
          name: "Booty/Leg Activation",
          sets: "5 min",
          reps: "-",
          videoUrl: "",
          activationSteps: [
            "Squat Jump (60 seconds)",
            "Booty weight squats 12-15 reps at moderate space (60 seconds)",
            "Band Glute Bridge 2 reps of 30 seconds (total 60 seconds)",
            "Banded Straight Leg Rainbow Kicks 2 reps of 30 seconds (total 60 seconds)"
          ]
        },
        {
          id: "l1-mon-2",
          name: "Kickbacks",
          sets: "1 warm up set",
          reps: "10-12 reps",
          notes: "Approx. 50% of your average working weight",
          videoUrl: "/RealisticWhiteGirlKickBack.mp4"
        },
        {
          id: "l1-mon-3",
          name: "Kickbacks",
          sets: "3 sets (each side)",
          reps: "12-15 reps",
          videoUrl: "/RealisticWhiteGirlKickBack.mp4"
        },
        {
          id: "l1-mon-4",
          name: "Hip Thrust",
          sets: "1 warm up set",
          reps: "10-12 reps",
          videoUrl: ""
        },
        {
          id: "l1-mon-5",
          name: "Hip Thrust",
          sets: "3 sets",
          reps: "8 reps",
          videoUrl: ""
        },
        {
          id: "l1-mon-6",
          name: "Hip Thrust",
          sets: "1 AMRAP set",
          reps: "As many reps as possible",
          notes: "Approx. 20% of your average working weight",
          videoUrl: ""
        },
        {
          id: "l1-mon-7",
          name: "Hyperextensions",
          sets: "1 warm up set",
          reps: "10-12 reps",
          videoUrl: ""
        },
        {
          id: "l1-mon-8",
          name: "Hyperextensions",
          sets: "3 sets",
          reps: "10-12 reps",
          notes: "10 sec hold on the last rep of every set",
          videoUrl: ""
        },
        {
          id: "l1-mon-9",
          name: "Hyperextensions",
          sets: "1 AMRAP set",
          reps: "As many reps as possible",
          notes: "Without weight",
          videoUrl: ""
        },
        {
          id: "l1-mon-10",
          name: "RDLs (Romanian Deadlifts)",
          sets: "1 warm up set",
          reps: "10-12 reps",
          videoUrl: ""
        },
        {
          id: "l1-mon-11",
          name: "RDLs (Romanian Deadlifts)",
          sets: "3 sets",
          reps: "8 reps",
          videoUrl: ""
        },
        {
          id: "l1-mon-12",
          name: "Treadmill Workout",
          sets: "1 min 30 sec",
          reps: "Speed 5.5 km/h",
          videoUrl: "/Joane_Trademil.mp4"
        },
        {
          id: "l1-mon-13",
          name: "Treadmill Workout",
          sets: "3 min",
          reps: "Speed 9.5 km/h",
          videoUrl: "/Joane_Trademil.mp4"
        },
        {
          id: "l1-mon-14",
          name: "Treadmill Workout",
          sets: "30 sec",
          reps: "Speed 12 km/h",
          videoUrl: "/Joane_Trademil.mp4"
        },
        {
          id: "l1-mon-15",
          name: "Stretching",
          sets: "5 min",
          reps: "-",
          videoUrl: ""
        }
      ]
    },
    Tuesday: {
      title: "ABS/CORE & CARDIO",
      exercises: [
        {
          id: "l1-tue-1",
          name: "Abs/Core Workout",
          sets: "20-30 min",
          reps: "-",
          notes: "Complete core circuit",
          videoUrl: ""
        },
        {
          id: "l1-tue-2",
          name: "Cardio Session",
          sets: "20-30 min",
          reps: "-",
          notes: "Your choice of cardio",
          videoUrl: ""
        }
      ]
    },
    Wednesday: {
      title: "REST",
      exercises: [
        {
          id: "l1-wed-1",
          name: "Rest Day",
          sets: "-",
          reps: "-",
          notes: "Recovery and stretching",
          videoUrl: ""
        }
      ]
    },
    Thursday: {
      title: "LEGS & BOOTY",
      exercises: [
        {
          id: "l1-thu-1",
          name: "Booty/Leg Activation",
          sets: "5 min",
          reps: "-",
          videoUrl: "",
          activationSteps: [
            "Squat Jump (60 seconds)",
            "Booty weight squats 12-15 reps at moderate space (60 seconds)",
            "Band Glute Bridge 2 reps of 30 seconds (total 60 seconds)",
            "Banded Straight Leg Rainbow Kicks 2 reps of 30 seconds (total 60 seconds)"
          ]
        },
        {
          id: "l1-thu-2",
          name: "Hip Thrust",
          sets: "1 warm up set",
          reps: "10-12 reps",
          videoUrl: ""
        },
        {
          id: "l1-thu-3",
          name: "Hip Thrust",
          sets: "3 sets",
          reps: "8 reps",
          videoUrl: ""
        },
        {
          id: "l1-thu-4",
          name: "Hip Thrust",
          sets: "1 AMRAP set",
          reps: "As many reps as possible",
          videoUrl: ""
        },
        {
          id: "l1-thu-5",
          name: "Hyperextensions",
          sets: "1 warm up set",
          reps: "10-12 reps",
          videoUrl: ""
        },
        {
          id: "l1-thu-6",
          name: "Hyperextensions",
          sets: "3 sets",
          reps: "10-12 reps",
          notes: "10 sec hold on the last rep of every set",
          videoUrl: ""
        },
        {
          id: "l1-thu-7",
          name: "Hyperextensions",
          sets: "1 AMRAP set",
          reps: "As many reps as possible",
          notes: "Without weight",
          videoUrl: ""
        },
        {
          id: "l1-thu-8",
          name: "Bulgarian Split Squats",
          sets: "1 warm up set",
          reps: "10-12 reps",
          videoUrl: "/Woman doing Lunges.mp4"
        },
        {
          id: "l1-thu-9",
          name: "Bulgarian Split Squats",
          sets: "3 sets (each side)",
          reps: "8 reps",
          videoUrl: "/Woman doing Lunges.mp4"
        },
        {
          id: "l1-thu-10",
          name: "Bulgarian Split Squats",
          sets: "1 AMRAP set",
          reps: "As many reps as possible",
          notes: "Without weight",
          videoUrl: "/Woman doing Lunges.mp4"
        },
        {
          id: "l1-thu-11",
          name: "Leg Curl",
          sets: "1 warm up set",
          reps: "10-12 reps",
          videoUrl: ""
        },
        {
          id: "l1-thu-12",
          name: "Leg Curl",
          sets: "3 sets",
          reps: "12-15 reps",
          videoUrl: ""
        },
        {
          id: "l1-thu-13",
          name: "Treadmill Workout",
          sets: "1 min 30 sec",
          reps: "Speed 5.5 km/h",
          videoUrl: "/Joane_Trademil.mp4"
        },
        {
          id: "l1-thu-14",
          name: "Treadmill Workout",
          sets: "3 min",
          reps: "Speed 9.5 km/h",
          videoUrl: "/Joane_Trademil.mp4"
        },
        {
          id: "l1-thu-15",
          name: "Treadmill Workout",
          sets: "30 sec",
          reps: "Speed 12 km/h",
          videoUrl: "/Joane_Trademil.mp4"
        },
        {
          id: "l1-thu-16",
          name: "Stretching",
          sets: "5 min",
          reps: "-",
          videoUrl: ""
        }
      ]
    },
    Friday: {
      title: "ABS/CORE ONLY",
      exercises: [
        {
          id: "l1-fri-1",
          name: "Abs/Core Workout",
          sets: "20-30 min",
          reps: "-",
          notes: "You can do at home",
          videoUrl: ""
        }
      ]
    },
    Saturday: {
      title: "LIGHT SHOULDERS & BACK",
      exercises: [
        {
          id: "l1-sat-1",
          name: "Light Shoulder & Back Workout",
          sets: "30-40 min",
          reps: "-",
          notes: "Focus on form, not heavy weight",
          videoUrl: ""
        }
      ]
    },
    Sunday: {
      title: "REST",
      exercises: [
        {
          id: "l1-sun-1",
          name: "Rest Day",
          sets: "-",
          reps: "-",
          notes: "Recovery and meal prep",
          videoUrl: ""
        }
      ]
    }
  },
  "Level 2": {
    Monday: {
      title: "BOOTY",
      exercises: [
        {
          id: "l2-mon-1",
          name: "Booty/Leg Activation",
          sets: "5 min",
          reps: "-",
          videoUrl: "",
          activationSteps: [
            "Squat Jump (60 seconds)",
            "Booty weight squats 12-15 reps at moderate space (60 seconds)",
            "Band Glute Bridge 2 reps of 30 seconds (total 60 seconds)",
            "Banded Straight Leg Rainbow Kicks 2 reps of 30 seconds (total 60 seconds)"
          ]
        },
        {
          id: "l2-mon-2",
          name: "Kickbacks",
          sets: "1 warm up set",
          reps: "10-12 reps",
          videoUrl: "/RealisticWhiteGirlKickBack.mp4"
        },
        {
          id: "l2-mon-3",
          name: "Kickbacks",
          sets: "3 sets (each side)",
          reps: "12-15 reps",
          videoUrl: "/RealisticWhiteGirlKickBack.mp4"
        },
        {
          id: "l2-mon-4",
          name: "Hip Thrust",
          sets: "1 warm up set",
          reps: "10-12 reps",
          videoUrl: ""
        },
        {
          id: "l2-mon-5",
          name: "Hip Thrust",
          sets: "3 sets",
          reps: "8 reps",
          videoUrl: ""
        },
        {
          id: "l2-mon-6",
          name: "Hip Thrust",
          sets: "1 AMRAP set",
          reps: "As many reps as possible",
          videoUrl: ""
        },
        {
          id: "l2-mon-7",
          name: "Hyperextensions",
          sets: "1 warm up set",
          reps: "10-12 reps",
          videoUrl: ""
        },
        {
          id: "l2-mon-8",
          name: "Hyperextensions",
          sets: "3 sets",
          reps: "10-12 reps",
          notes: "10 sec hold on the last rep of every set",
          videoUrl: ""
        },
        {
          id: "l2-mon-9",
          name: "Hyperextensions",
          sets: "1 AMRAP set",
          reps: "As many reps as possible",
          notes: "Without weight",
          videoUrl: ""
        },
        {
          id: "l2-mon-10",
          name: "RDLs (Romanian Deadlifts)",
          sets: "1 warm up set",
          reps: "10-12 reps",
          videoUrl: ""
        },
        {
          id: "l2-mon-11",
          name: "RDLs (Romanian Deadlifts)",
          sets: "3 sets",
          reps: "8 reps",
          videoUrl: ""
        },
        {
          id: "l2-mon-12",
          name: "Abductors",
          sets: "1 warm up set",
          reps: "10-12 reps",
          videoUrl: ""
        },
        {
          id: "l2-mon-13",
          name: "Abductors",
          sets: "3 sets",
          reps: "12-15 reps",
          videoUrl: ""
        },
        {
          id: "l2-mon-14",
          name: "Leg Finisher - Single Leg Hip Thrust",
          sets: "1 set (each side)",
          reps: "15-20 reps",
          notes: "Light weight",
          videoUrl: ""
        },
        {
          id: "l2-mon-15",
          name: "Leg Finisher - Sumo Squats",
          sets: "1 set",
          reps: "15-20 reps",
          videoUrl: ""
        },
        {
          id: "l2-mon-16",
          name: "Leg Finisher - Squat Jumps",
          sets: "1 set",
          reps: "10-12 reps",
          videoUrl: ""
        },
        {
          id: "l2-mon-17",
          name: "Stretching",
          sets: "5 min",
          reps: "-",
          videoUrl: ""
        }
      ]
    },
    Tuesday: {
      title: "LIGHT SHOULDERS & BACK",
      exercises: [
        {
          id: "l2-tue-1",
          name: "Light Shoulder & Back Workout",
          sets: "30-40 min",
          reps: "-",
          notes: "Focus on form and mind-muscle connection",
          videoUrl: ""
        }
      ]
    },
    Wednesday: {
      title: "ABS/CORE & CARDIO",
      exercises: [
        {
          id: "l2-wed-1",
          name: "Abs/Core Workout",
          sets: "20-30 min",
          reps: "-",
          videoUrl: ""
        },
        {
          id: "l2-wed-2",
          name: "Cardio Session",
          sets: "20-30 min",
          reps: "-",
          notes: "Your choice of cardio",
          videoUrl: ""
        }
      ]
    },
    Thursday: {
      title: "BOOTY",
      exercises: [
        {
          id: "l2-thu-1",
          name: "Booty/Leg Activation",
          sets: "5 min",
          reps: "-",
          videoUrl: "",
          activationSteps: [
            "Squat Jump (60 seconds)",
            "Booty weight squats 12-15 reps at moderate space (60 seconds)",
            "Band Glute Bridge 2 reps of 30 seconds (total 60 seconds)",
            "Banded Straight Leg Rainbow Kicks 2 reps of 30 seconds (total 60 seconds)"
          ]
        },
        {
          id: "l2-thu-2",
          name: "Hip Thrust",
          sets: "1 warm up set",
          reps: "10-12 reps",
          videoUrl: ""
        },
        {
          id: "l2-thu-3",
          name: "Hip Thrust",
          sets: "3 sets",
          reps: "8 reps",
          videoUrl: ""
        },
        {
          id: "l2-thu-4",
          name: "Hip Thrust",
          sets: "1 AMRAP set",
          reps: "As many reps as possible",
          videoUrl: ""
        },
        {
          id: "l2-thu-5",
          name: "Hyperextensions",
          sets: "1 warm up set",
          reps: "10-12 reps",
          videoUrl: ""
        },
        {
          id: "l2-thu-6",
          name: "Hyperextensions",
          sets: "3 sets",
          reps: "10-12 reps",
          notes: "10 sec hold on the last rep of every set",
          videoUrl: ""
        },
        {
          id: "l2-thu-7",
          name: "Hyperextensions",
          sets: "1 AMRAP set",
          reps: "As many reps as possible",
          notes: "Without weight",
          videoUrl: ""
        },
        {
          id: "l2-thu-8",
          name: "Bulgarian Split Squats",
          sets: "1 warm up set",
          reps: "10-12 reps",
          videoUrl: "/Woman doing Lunges.mp4"
        },
        {
          id: "l2-thu-9",
          name: "Bulgarian Split Squats",
          sets: "3 sets (each side)",
          reps: "8 reps",
          videoUrl: "/Woman doing Lunges.mp4"
        },
        {
          id: "l2-thu-10",
          name: "Bulgarian Split Squats",
          sets: "1 AMRAP set",
          reps: "As many reps as possible",
          notes: "Without weight",
          videoUrl: "/Woman doing Lunges.mp4"
        },
        {
          id: "l2-thu-11",
          name: "Leg Press",
          sets: "1 warm up set",
          reps: "10-12 reps",
          videoUrl: ""
        },
        {
          id: "l2-thu-12",
          name: "Leg Press",
          sets: "3 sets",
          reps: "8-10 reps",
          videoUrl: ""
        },
        {
          id: "l2-thu-13",
          name: "Leg Curl",
          sets: "1 warm up set",
          reps: "10-12 reps",
          videoUrl: ""
        },
        {
          id: "l2-thu-14",
          name: "Leg Curl",
          sets: "3 sets",
          reps: "12-15 reps",
          videoUrl: ""
        },
        {
          id: "l2-thu-15",
          name: "Treadmill Workout",
          sets: "4 min",
          reps: "Speed 5.5 km/h",
          videoUrl: "/Joane_Trademil.mp4"
        },
        {
          id: "l2-thu-16",
          name: "Treadmill Workout",
          sets: "5 min",
          reps: "Speed 9.5 km/h",
          videoUrl: "/Joane_Trademil.mp4"
        },
        {
          id: "l2-thu-17",
          name: "Treadmill Workout",
          sets: "1 min",
          reps: "Speed 12 km/h",
          videoUrl: "/Joane_Trademil.mp4"
        },
        {
          id: "l2-thu-18",
          name: "Stretching",
          sets: "5 min",
          reps: "-",
          videoUrl: ""
        }
      ]
    },
    Friday: {
      title: "SHOULDERS & ABS/CORE",
      exercises: [
        {
          id: "l2-fri-1",
          name: "Shoulder Workout",
          sets: "20-25 min",
          reps: "-",
          videoUrl: ""
        },
        {
          id: "l2-fri-2",
          name: "Abs/Core Workout",
          sets: "20-25 min",
          reps: "-",
          videoUrl: ""
        }
      ]
    },
    Saturday: {
      title: "LEGS & BOOTY",
      exercises: [
        {
          id: "l2-sat-1",
          name: "Booty/Leg Activation",
          sets: "5 min",
          reps: "-",
          videoUrl: "",
          activationSteps: [
            "Squat Jump (60 seconds)",
            "Booty weight squats 12-15 reps at moderate space (60 seconds)",
            "Band Glute Bridge 2 reps of 30 seconds (total 60 seconds)",
            "Banded Straight Leg Rainbow Kicks 2 reps of 30 seconds (total 60 seconds)"
          ]
        },
        {
          id: "l2-sat-2",
          name: "Hip Thrust",
          sets: "1 warm up set",
          reps: "10-12 reps",
          videoUrl: ""
        },
        {
          id: "l2-sat-3",
          name: "Hip Thrust",
          sets: "3 sets",
          reps: "8 reps",
          videoUrl: ""
        },
        {
          id: "l2-sat-4",
          name: "Hip Thrust",
          sets: "1 AMRAP set",
          reps: "As many reps as possible",
          videoUrl: ""
        },
        {
          id: "l2-sat-5",
          name: "Hyperextensions",
          sets: "1 warm up set",
          reps: "10-12 reps",
          videoUrl: ""
        },
        {
          id: "l2-sat-6",
          name: "Hyperextensions",
          sets: "3 sets",
          reps: "10-12 reps",
          notes: "10 sec hold on the last rep of every set",
          videoUrl: ""
        },
        {
          id: "l2-sat-7",
          name: "Hyperextensions",
          sets: "1 AMRAP set",
          reps: "As many reps as possible",
          notes: "Without weight",
          videoUrl: ""
        },
        {
          id: "l2-sat-8",
          name: "Bulgarian Split Squats",
          sets: "1 warm up set",
          reps: "10-12 reps",
          videoUrl: "/Woman doing Lunges.mp4"
        },
        {
          id: "l2-sat-9",
          name: "Bulgarian Split Squats",
          sets: "3 sets (each side)",
          reps: "8 reps",
          videoUrl: "/Woman doing Lunges.mp4"
        },
        {
          id: "l2-sat-10",
          name: "Bulgarian Split Squats",
          sets: "1 AMRAP set",
          reps: "As many reps as possible",
          notes: "Without weight",
          videoUrl: "/Woman doing Lunges.mp4"
        },
        {
          id: "l2-sat-11",
          name: "Leg Press",
          sets: "1 warm up set",
          reps: "10-12 reps",
          videoUrl: ""
        },
        {
          id: "l2-sat-12",
          name: "Leg Press",
          sets: "3 sets",
          reps: "8-10 reps",
          videoUrl: ""
        },
        {
          id: "l2-sat-13",
          name: "Leg Curl",
          sets: "1 warm up set",
          reps: "10-12 reps",
          videoUrl: ""
        },
        {
          id: "l2-sat-14",
          name: "Leg Curl",
          sets: "3 sets",
          reps: "12-15 reps",
          videoUrl: ""
        },
        {
          id: "l2-sat-15",
          name: "Treadmill Workout",
          sets: "4 min",
          reps: "Speed 5.5 km/h",
          videoUrl: "/Joane_Trademil.mp4"
        },
        {
          id: "l2-sat-16",
          name: "Treadmill Workout",
          sets: "5 min",
          reps: "Speed 9.5 km/h",
          videoUrl: "/Joane_Trademil.mp4"
        },
        {
          id: "l2-sat-17",
          name: "Treadmill Workout",
          sets: "1 min",
          reps: "Speed 12 km/h",
          videoUrl: "/Joane_Trademil.mp4"
        },
        {
          id: "l2-sat-18",
          name: "Stretching",
          sets: "5 min",
          reps: "-",
          videoUrl: ""
        }
      ]
    },
    Sunday: {
      title: "REST",
      exercises: [
        {
          id: "l2-sun-1",
          name: "Rest Day",
          sets: "-",
          reps: "-",
          notes: "Recovery and meal prep",
          videoUrl: ""
        }
      ]
    }
  }
};

export const daysOfWeek = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
