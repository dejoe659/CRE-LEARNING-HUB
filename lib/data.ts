/**
 * SAMPLE DATA ONLY.
 * These courses are demonstration content to showcase the platform.
 * They are NOT an official UNN (or any institution's) curriculum.
 * Administrators replace this with real courses stored in Supabase.
 */

export type Level = 100 | 200 | 300 | 400;
export type Semester = 1 | 2;

export interface Lesson {
  id: string;
  title: string;
  duration: number; // seconds
  summary: string;
  objectives: string[];
  example?: string;
  videoUrl?: string; // MP4 / HLS / Cloudflare Stream URL once uploaded
  scene: "circuit" | "code" | "robot" | "network" | "data" | "sensor";
}

export interface Module {
  id: string;
  title: string;
  lessons: Lesson[];
  quiz: QuizQuestion[];
}

export interface Course {
  id?: string; // database id (undefined for built-in sample courses)
  code: string;
  title: string;
  level: Level;
  semester: Semester;
  units: number;
  description: string;
  instructor?: string;
  premium: boolean;
  price: number; // Naira
  rating?: number;
  students?: number;
  tag?: string;
  modules: Module[];
}

export interface QuizQuestion {
  id: string;
  type: "mcq" | "tf" | "short";
  question: string;
  options?: string[];
  answer: string; // for mcq: option text; tf: "True"/"False"; short: accepted keyword(s) separated by |
  explanation: string;
}

/** A quiz or examination ready to run. `remote` exams are marked on the server; sample ones locally. */
export interface ExamItem {
  id: string;
  courseCode: string;
  courseTitle: string;
  title: string;
  timeLimitSec?: number;
  moduleId?: string;
  questions: QuizQuestion[];
  remote: boolean;
}

export const LEVELS: { level: Level; title: string; blurb: string; color: string }[] = [
  { level: 100, title: "Foundation", blurb: "Computing fundamentals, basic electronics and problem solving.", color: "from-sky-500 to-brand-600" },
  { level: 200, title: "Core Skills", blurb: "Programming, data structures, circuits and microcontrollers.", color: "from-brand-500 to-indigo-600" },
  { level: 300, title: "Applied Systems", blurb: "Embedded systems, control theory, networks and databases.", color: "from-indigo-500 to-violet-600" },
  { level: 400, title: "Advanced & Capstone", blurb: "Machine learning, autonomous robotics and final-year projects.", color: "from-violet-500 to-fuchsia-600" },
];

let uid = 0;
const id = (p: string) => `${p}-${++uid}`;

function lesson(
  title: string,
  mins: number,
  scene: Lesson["scene"],
  summary: string,
  objectives: string[],
  example: string
): Lesson {
  return { id: id("l"), title, duration: mins * 60, scene, summary, objectives, example };
}

function q(
  type: QuizQuestion["type"],
  question: string,
  answer: string,
  explanation: string,
  options?: string[]
): QuizQuestion {
  return { id: id("q"), type, question, answer, explanation, options };
}

const mod = (title: string, lessons: Lesson[], quiz: QuizQuestion[]): Module => ({
  id: id("m"),
  title,
  lessons,
  quiz,
});

function course(
  code: string,
  title: string,
  level: Level,
  semester: Semester,
  units: number,
  description: string,
  instructor: string,
  tag: string,
  modules: Module[],
  premium = false,
  price = 0,
  rating = 4.7,
  students = 120
): Course {
  return { code, title, level, semester, units, description, instructor, tag, modules, premium, price, rating, students };
}

export const COURSES: Course[] = [
  /* ---------------- 100 LEVEL ---------------- */
  course(
    "SMP 101",
    "Introduction to Computing",
    100, 1, 3,
    "How computers represent, store and process information — from bits and logic gates to operating systems.",
    "Sample Instructor", "Computing",
    [
      mod("Inside the Computer", [
        lesson("What is a computer?", 9, "circuit", "A tour of input, processing, storage and output.", ["Define a computer system", "Name the main hardware components", "Explain the fetch-decode-execute cycle"], "Trace what happens between pressing a key and seeing the letter on screen."),
        lesson("Binary and number systems", 12, "data", "Why computers use 0s and 1s, and how to convert between binary, decimal and hex.", ["Convert decimal to binary", "Add binary numbers", "Read hexadecimal"], "Convert 45₁₀ to binary: 101101₂."),
        lesson("Logic gates", 11, "circuit", "AND, OR, NOT and how gates combine to make decisions.", ["Draw truth tables", "Combine gates into circuits"], "Build a half-adder from XOR and AND gates."),
      ], [
        q("mcq", "Which number system do computers use internally?", "Binary", "Digital circuits have two stable states, represented as 0 and 1.", ["Decimal", "Binary", "Octal", "Roman"]),
        q("tf", "An AND gate outputs 1 only when all inputs are 1.", "True", "AND is true only if every input is true."),
        q("short", "What is 1010 in binary, written in decimal?", "10|ten", "8 + 0 + 2 + 0 = 10."),
      ]),
      mod("Software & Operating Systems", [
        lesson("System vs application software", 8, "code", "What the operating system actually does for you.", ["Differentiate system and application software", "List OS responsibilities"], "Explain why a printer needs a driver."),
        lesson("Files, memory and processes", 10, "data", "How the OS shares CPU time and memory between programs.", ["Describe a process", "Explain virtual memory"], "Open three apps and observe them in a task manager."),
      ], [
        q("mcq", "Which of these is system software?", "Operating system", "The OS manages hardware for all other programs.", ["Web browser", "Operating system", "Spreadsheet", "Game"]),
      ]),
    ],
    false, 0, 4.8, 842
  ),
  course(
    "SMP 103",
    "Basic Electricity & Electronics",
    100, 1, 3,
    "Voltage, current, resistance and the building blocks of every robot: resistors, capacitors, diodes and transistors.",
    "Sample Instructor", "Electronics",
    [
      mod("Electric Circuits", [
        lesson("Voltage, current and resistance", 12, "circuit", "Ohm's law explained with water-flow animations.", ["State Ohm's law", "Calculate V, I and R", "Read a simple circuit diagram"], "A 9 V battery drives a 450 Ω resistor: I = V/R = 20 mA."),
        lesson("Series and parallel circuits", 13, "circuit", "How components share voltage and current.", ["Compute equivalent resistance", "Predict brightness of bulbs"], "Two 100 Ω resistors in parallel give 50 Ω."),
      ], [
        q("mcq", "Ohm's law is:", "V = I × R", "Voltage equals current multiplied by resistance.", ["V = I / R", "V = I × R", "I = V × R", "R = V × I"]),
        q("short", "A 12 V supply across 4 Ω draws how many amps?", "3", "I = V/R = 12/4 = 3 A."),
      ]),
    ],
    false, 0, 4.6, 703
  ),
  course(
    "SMP 102",
    "Problem Solving & Algorithms",
    100, 2, 3,
    "Think like a programmer: flowcharts, pseudocode and your first programs in Python.",
    "Sample Instructor", "Programming",
    [
      mod("Thinking in Algorithms", [
        lesson("Flowcharts and pseudocode", 10, "code", "Turning a problem into clear steps.", ["Draw a flowchart", "Write pseudocode"], "Algorithm to find the largest of three numbers."),
        lesson("Variables, loops and conditions", 14, "code", "The three ideas behind nearly every program.", ["Use variables", "Write for and while loops", "Branch with if/else"], "Print the times table for any number."),
      ], [
        q("tf", "A loop repeats a block of code.", "True", "Loops let you repeat work without copying code."),
        q("mcq", "Which structure makes a decision?", "if / else", "Conditionals pick between paths.", ["for", "if / else", "print", "import"]),
      ]),
    ],
    false, 0, 4.9, 910
  ),
  course(
    "SMP 104",
    "Introduction to Robotics",
    100, 2, 2,
    "What is a robot? Meet sensors, actuators and controllers and see real robots in action.",
    "Sample Instructor", "Robotics",
    [
      mod("Anatomy of a Robot", [
        lesson("Sensors, actuators and controllers", 11, "robot", "The sense–think–act loop that powers every robot.", ["Name common sensors", "Describe actuators", "Explain the sense-think-act loop"], "A line-follower: infrared sensors → controller → motors."),
        lesson("Robot types and applications", 9, "robot", "Industrial arms, mobile robots, drones and humanoids.", ["Classify robots", "Give application examples"], "Compare a warehouse robot with a surgical robot."),
      ], [
        q("mcq", "Which component converts electrical signals into motion?", "Actuator", "Motors and servos are actuators.", ["Sensor", "Actuator", "Battery", "Display"]),
      ]),
    ],
    true, 5000, 4.7, 540
  ),

  /* ---------------- 200 LEVEL ---------------- */
  course(
    "SMP 201",
    "Programming with Python",
    200, 1, 3,
    "Functions, data structures, files and object-oriented programming — with robotics-flavoured projects.",
    "Sample Instructor", "Programming",
    [
      mod("Python Essentials", [
        lesson("Functions and modules", 13, "code", "Reusable building blocks.", ["Define functions", "Import modules"], "Write a function that converts Celsius to Fahrenheit."),
        lesson("Lists, tuples and dictionaries", 15, "data", "Choosing the right container.", ["Use lists and dicts", "Iterate and filter data"], "Store sensor readings in a list and compute the average."),
        lesson("Object-oriented programming", 18, "code", "Classes and objects model real-world things such as a Robot.", ["Create classes", "Use inheritance"], "class Robot: with move() and turn() methods."),
      ], [
        q("mcq", "Which structure stores key–value pairs?", "Dictionary", "Dictionaries map keys to values.", ["List", "Tuple", "Dictionary", "Set"]),
        q("tf", "A class is a blueprint for objects.", "True", "Objects are instances of classes."),
        q("short", "Which keyword defines a function in Python?", "def", "Functions start with def."),
      ]),
    ],
    false, 0, 4.9, 1204
  ),
  course(
    "SMP 203",
    "Digital Logic Design",
    200, 1, 3,
    "Boolean algebra, combinational and sequential circuits, counters and memory.",
    "Sample Instructor", "Electronics",
    [
      mod("Combinational Logic", [
        lesson("Boolean algebra and Karnaugh maps", 16, "circuit", "Simplify logic with K-maps.", ["Simplify Boolean expressions", "Use K-maps"], "Simplify A·B + A·B′ = A."),
        lesson("Adders, multiplexers and decoders", 14, "circuit", "Building blocks of a CPU.", ["Design a full adder", "Use a multiplexer"], "A 4:1 multiplexer selects one of four inputs."),
      ], [
        q("mcq", "A + A·B simplifies to:", "A", "Absorption law.", ["A", "B", "A·B", "A+B"]),
      ]),
    ],
    true, 7500, 4.6, 388
  ),
  course(
    "SMP 202",
    "Data Structures & Algorithms",
    200, 2, 3,
    "Stacks, queues, trees, graphs, sorting and searching — and how to measure efficiency with Big-O.",
    "Sample Instructor", "Programming",
    [
      mod("Linear Structures", [
        lesson("Stacks and queues", 12, "data", "LIFO and FIFO explained with animations.", ["Implement a stack", "Implement a queue"], "Undo history uses a stack."),
        lesson("Big-O notation", 14, "data", "How to compare algorithms.", ["Classify O(1), O(n), O(n²)", "Analyse a loop"], "Binary search is O(log n)."),
      ], [
        q("mcq", "Which structure is LIFO?", "Stack", "Last in, first out.", ["Queue", "Stack", "Array", "Graph"]),
        q("short", "What is the time complexity of binary search?", "log n|O(log n)|logarithmic", "It halves the search space each step."),
      ]),
    ],
    false, 0, 4.8, 976
  ),
  course(
    "SMP 204",
    "Microcontrollers & Arduino",
    200, 2, 3,
    "Program real hardware: GPIO, PWM, interrupts and reading sensors with Arduino.",
    "Sample Instructor", "Robotics",
    [
      mod("Arduino Basics", [
        lesson("Digital I/O and PWM", 13, "sensor", "Blink an LED and dim it with PWM.", ["Configure pins", "Use analogWrite"], "pinMode(13, OUTPUT); digitalWrite(13, HIGH);"),
        lesson("Reading sensors", 15, "sensor", "Analog inputs, ultrasonic distance and debouncing.", ["Read an analog sensor", "Convert readings to units"], "HC-SR04: distance = time × 0.034 / 2 cm."),
      ], [
        q("mcq", "PWM stands for:", "Pulse Width Modulation", "Varying the duty cycle controls average power.", ["Power Wave Mode", "Pulse Width Modulation", "Phase Wire Motor", "Pulse Wave Memory"]),
      ]),
    ],
    true, 8000, 4.9, 612
  ),

  /* ---------------- 300 LEVEL ---------------- */
  course(
    "SMP 301",
    "Embedded Systems",
    300, 1, 3,
    "Design firmware for resource-constrained devices: timers, interrupts, communication buses and RTOS basics.",
    "Sample Instructor", "Robotics",
    [
      mod("Firmware Fundamentals", [
        lesson("Timers and interrupts", 16, "sensor", "Event-driven programming on microcontrollers.", ["Configure a hardware timer", "Write an ISR"], "Toggle an LED every 500 ms with a timer interrupt."),
        lesson("I²C, SPI and UART", 17, "network", "How chips talk to each other.", ["Compare serial protocols", "Choose a bus"], "Read an IMU over I²C."),
      ], [
        q("mcq", "Which protocol uses two wires (SDA and SCL)?", "I²C", "Inter-Integrated Circuit.", ["SPI", "I²C", "UART", "CAN"]),
      ]),
    ],
    true, 10000, 4.7, 301
  ),
  course(
    "SMP 303",
    "Control Systems",
    300, 1, 3,
    "Feedback, transfer functions and PID control — the maths behind stable robots.",
    "Sample Instructor", "Robotics",
    [
      mod("Feedback Control", [
        lesson("Open vs closed loop", 11, "robot", "Why feedback matters.", ["Differentiate loops", "Draw a block diagram"], "Cruise control is a closed-loop system."),
        lesson("PID controllers", 19, "robot", "Tune P, I and D to follow a line smoothly.", ["Explain each PID term", "Tune a controller"], "Higher Kp reacts faster but can oscillate."),
      ], [
        q("mcq", "Which PID term removes steady-state error?", "Integral", "The I term accumulates past error.", ["Proportional", "Integral", "Derivative", "None"]),
        q("tf", "A closed-loop system uses feedback.", "True", "Output is measured and compared with the setpoint."),
      ]),
    ],
    true, 10000, 4.8, 276
  ),
  course(
    "SMP 302",
    "Database Systems",
    300, 2, 3,
    "Relational modelling, SQL, normalisation, transactions and PostgreSQL in practice.",
    "Sample Instructor", "Computing",
    [
      mod("Relational Databases", [
        lesson("Tables, keys and relationships", 12, "data", "Designing a clean schema.", ["Define primary and foreign keys", "Draw an ER diagram"], "students ⟶ enrollments ⟵ courses."),
        lesson("SQL queries and joins", 17, "data", "SELECT, JOIN, GROUP BY.", ["Write joins", "Aggregate data"], "SELECT level, COUNT(*) FROM courses GROUP BY level;"),
      ], [
        q("short", "Which SQL keyword combines rows from two tables?", "join", "JOIN merges tables on a related column."),
      ]),
    ],
    false, 0, 4.6, 410
  ),
  course(
    "SMP 304",
    "Computer Networks & IoT",
    300, 2, 3,
    "TCP/IP, wireless protocols and connecting robots to the cloud with MQTT.",
    "Sample Instructor", "Computing",
    [
      mod("Networking Basics", [
        lesson("The TCP/IP stack", 14, "network", "How data travels from sensor to cloud.", ["Name the layers", "Trace a packet"], "A temperature reading travels via MQTT over TCP."),
      ], [
        q("mcq", "Which protocol is lightweight and popular in IoT?", "MQTT", "Publish/subscribe messaging over TCP.", ["FTP", "MQTT", "SMTP", "Telnet"]),
      ]),
    ],
    true, 9000, 4.5, 233
  ),

  /* ---------------- 400 LEVEL ---------------- */
  course(
    "SMP 401",
    "Machine Learning for Robotics",
    400, 1, 3,
    "Supervised learning, neural networks and computer vision applied to robot perception.",
    "Sample Instructor", "AI",
    [
      mod("Learning from Data", [
        lesson("Supervised learning basics", 15, "data", "Training, testing and overfitting.", ["Split data", "Evaluate a model"], "Classify obstacles from camera features."),
        lesson("Neural networks", 20, "data", "Neurons, layers and back-propagation animated.", ["Describe a neuron", "Explain gradient descent"], "A 3-layer network learns XOR."),
      ], [
        q("mcq", "Overfitting means the model:", "Memorises training data", "It performs poorly on unseen data.", ["Is too simple", "Memorises training data", "Trains too fast", "Has no data"]),
      ]),
    ],
    true, 15000, 4.9, 189
  ),
  course(
    "SMP 403",
    "Autonomous Robot Navigation",
    400, 1, 3,
    "SLAM, path planning (A*), obstacle avoidance and ROS 2 fundamentals.",
    "Sample Instructor", "Robotics",
    [
      mod("Path Planning", [
        lesson("Grid maps and A* search", 18, "robot", "Finding the shortest safe path.", ["Represent a map", "Run A* by hand"], "A* with Manhattan heuristic on a 10×10 grid."),
        lesson("Introduction to ROS 2", 16, "network", "Nodes, topics and messages.", ["Create a node", "Publish to a topic"], "A /cmd_vel publisher drives a simulated robot."),
      ], [
        q("tf", "A* uses a heuristic to guide the search.", "True", "f(n) = g(n) + h(n)."),
      ]),
    ],
    true, 15000, 4.8, 164
  ),
  course(
    "SMP 402",
    "Final Year Project",
    400, 2, 6,
    "Plan, build, test and present a robotics or computing project with a supervisor.",
    "Project Coordinator", "Project",
    [
      mod("Research & Planning", [
        lesson("Choosing and scoping a project", 10, "code", "From idea to a defensible proposal.", ["Write a problem statement", "Define scope and milestones"], "Turn 'a smart robot' into measurable objectives."),
        lesson("Writing the report", 12, "data", "Structure, referencing and presenting results.", ["Structure a thesis", "Present data clearly"], "Chapter outline: Introduction → Literature → Method → Results."),
      ], [
        q("tf", "A good project has measurable objectives.", "True", "Measurable goals let you evaluate success."),
      ]),
    ],
    false, 0, 4.7, 211
  ),
  course(
    "SMP 404",
    "Professional Practice & Ethics in Computing",
    400, 2, 2,
    "Ethics, intellectual property, safety and professional responsibility for engineers and educators.",
    "Sample Instructor", "Computing",
    [
      mod("Ethics in Technology", [
        lesson("Ethics of AI and robotics", 12, "robot", "Bias, safety and accountability.", ["Identify ethical risks", "Apply a decision framework"], "Who is responsible if an autonomous robot causes harm?"),
      ], [
        q("mcq", "Which is a key ethical concern in AI systems?", "Bias in training data", "Biased data leads to unfair outcomes.", ["Screen colour", "Bias in training data", "Font choice", "Cable length"]),
      ]),
    ],
    false, 0, 4.5, 150
  ),
];

/* ---------- helpers ---------- */
export const getCourse = (code: string) =>
  COURSES.find((c) => c.code.replace(/\s/g, "-").toLowerCase() === code.toLowerCase());

export const courseSlug = (code: string) => code.replace(/\s/g, "-").toLowerCase();

export const flatLessons = (c: Course) =>
  c.modules.flatMap((m) => m.lessons.map((l) => ({ ...l, moduleId: m.id, moduleTitle: m.title })));

export const coursesFor = (level: Level, semester?: Semester) =>
  COURSES.filter((c) => c.level === level && (semester ? c.semester === semester : true));

export const formatNaira = (n: number) => (n === 0 ? "Free" : `₦${n.toLocaleString("en-NG")}`);

export const fmtDuration = (s: number) => {
  const m = Math.floor(s / 60);
  const sec = Math.floor(s % 60);
  return `${m}:${sec.toString().padStart(2, "0")}`;
};

export const TESTIMONIALS = [
  { name: "Amaka O.", role: "300 Level student (sample testimonial)", text: "The animated explanations made PID control finally click. I rewatched the line-follower lesson three times." },
  { name: "Chinedu E.", role: "200 Level student (sample testimonial)", text: "Quizzes after every topic keep me honest. I can see exactly which concepts I still need to review." },
  { name: "Ngozi A.", role: "100 Level student (sample testimonial)", text: "I could study on my phone with low data. Resume watching is a lifesaver." },
];

export const MATERIALS = [
  { id: "mt1", course: "SMP 101", title: "Lecture Notes — Number Systems", kind: "Lecture Notes", size: "1.2 MB" },
  { id: "mt2", course: "SMP 103", title: "Practical Guide — Breadboard Basics", kind: "Practical Guide", size: "2.4 MB" },
  { id: "mt3", course: "SMP 102", title: "Course Summary — Algorithms", kind: "Course Summary", size: "640 KB" },
  { id: "mt4", course: "SMP 201", title: "Python Textbook Reference List", kind: "Textbook", size: "380 KB" },
  { id: "mt5", course: "SMP 202", title: "Sample Past Question — Data Structures", kind: "Past Questions", size: "910 KB" },
  { id: "mt6", course: "SMP 204", title: "Assignment 1 — Blink & Fade", kind: "Assignment", size: "210 KB" },
  { id: "mt7", course: "SMP 303", title: "Lecture Notes — PID Tuning", kind: "Lecture Notes", size: "1.8 MB" },
  { id: "mt8", course: "SMP 401", title: "Practical Guide — Training a Classifier", kind: "Practical Guide", size: "3.1 MB" },
];
