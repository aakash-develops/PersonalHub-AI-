export interface GridNotes {
  confused?: string;
  clicked?: string;
  mistakes?: string;
  revisit?: string;
  summary?: string;
  confidence?: number;
}

export interface SubtopicGrid {
  id: string;
  title: string;
  contents: string;
  whyImportant?: string;
  coreStudies: string;
  estimatedHours?: number;
  durationMinutes: number;
  difficulty?: "Beginner" | "Intermediate" | "Advanced" | "Expert";
  prerequisites?: string[];
  resources?: string[];
  notes?: GridNotes;
  tags?: string[];
  status?: "Not Started" | "In Progress" | "Completed" | "Review Needed";
  remarks?: string;
  isCompleted?: boolean;
  completedAt?: string;
  lastViewed?: string;
}

export interface RoadmapRow {
  id: string;
  title: string;
  timeline: string;
  color: string;
  grids: SubtopicGrid[];
}

export const FULL_CURRICULUM_DATA: RoadmapRow[] = [

 {
id: "row-0",
title: "0. Engineering Foundations",
timeline: "~35 Study Hours • Required Before Everything",
color: "#2563eb",
grids: [

{
id: "0-1",
title: "Git & GitHub",
contents:
"Version control fundamentals, collaboration workflows, commit history, branching strategies and repository management.",
coreStudies:
"Git initialization, commits, branches, merge vs rebase, pull requests, cherry-pick, resolving merge conflicts, semantic commits, GitHub workflow and repository organization.",
durationMinutes: 720,
remarks: "",
isCompleted: false
},

{
id: "0-2",
title: "Linux & Command Line",
contents:
"Become comfortable using the terminal instead of relying only on graphical interfaces.",
coreStudies:
"Linux filesystem, shell navigation, permissions, environment variables, grep, find, pipes, SSH, process management, package managers and scripting basics.",
durationMinutes: 600,
remarks: "",
isCompleted: false
},

{
id: "0-3",
title: "HTTP & Web Fundamentals",
contents:
"Understand how browsers communicate with servers before building APIs.",
coreStudies:
"HTTP methods, headers, cookies, sessions, HTTPS, DNS, request lifecycle, REST principles, JSON, status codes, authentication basics.",
durationMinutes: 900,
remarks: "",
isCompleted: false
},

{
id: "0-4",
title: "JavaScript Runtime",
contents:
"Understand JavaScript beyond syntax.",
coreStudies:
"Execution context, call stack, event loop, asynchronous programming, promises, async/await, closures, scopes, modules, memory and execution model.",
durationMinutes: 900,
remarks: "",
isCompleted: false
}

]
},

{
id: "row-1",
title: "1. Computer Science Foundations",
timeline: "~60 Study Hours • Core Engineering",
color: "#7c3aed",
grids: [

{
id: "1-1",
title: "Algorithm Analysis",
contents:
"Learn how to reason about performance rather than memorizing algorithms.",
coreStudies:
"Big-O, Big-Theta, Big-Omega, time complexity, space complexity, recursion complexity, amortized analysis, trade-offs.",
durationMinutes: 720,
remarks: "",
isCompleted: false
},

{
id: "1-2",
title: "Linear Data Structures",
contents:
"Master the structures every language provides internally.",
coreStudies:
"Arrays, Dynamic Arrays, Linked Lists, Stacks, Queues, Circular Queues, Deques and practical use cases.",
durationMinutes: 900,
remarks: "",
isCompleted: false
},

{
id: "1-3",
title: "Hashing",
contents:
"Fast lookup structures powering modern software.",
coreStudies:
"Hash functions, collision handling, chaining, open addressing, dictionaries, maps, sets and lookup complexity.",
durationMinutes: 600,
remarks: "",
isCompleted: false
},

{
id: "1-4",
title: "Trees & Graphs",
contents:
"Hierarchical and network based data structures.",
coreStudies:
"Binary Trees, BST, AVL, Heaps, Trie, Graphs, DFS, BFS, shortest path intuition and traversal algorithms.",
durationMinutes: 1080,
remarks: "",
isCompleted: false
},

{
id: "1-5",
title: "Searching & Sorting",
contents:
"Foundational algorithms used throughout software engineering.",
coreStudies:
"Binary Search, Merge Sort, Quick Sort, Heap Sort, Counting Sort, stability, recursion and practical complexity comparisons.",
durationMinutes: 900,
remarks: "",
isCompleted: false
}

]
},

{
id: "row-2",
title: "2. Mathematics for Machine Learning",
timeline: "~90 Study Hours • Mathematical Core",
color: "#9333ea",
grids: [

{
id: "2-1",
title: "Linear Algebra",
contents:
"The language of machine learning.",
coreStudies:
"Vectors, matrices, matrix multiplication, transpose, inverse, rank, basis, orthogonality, dot product, projections.",
durationMinutes: 1200,
remarks: "",
isCompleted: false
},

{
id: "2-2",
title: "Eigenvalues & Matrix Decomposition",
contents:
"Mathematics behind PCA and dimensionality reduction.",
coreStudies:
"Eigenvalues, Eigenvectors, SVD, covariance matrices and geometric interpretation.",
durationMinutes: 720,
remarks: "",
isCompleted: false
},

{
id: "2-3",
title: "Calculus",
contents:
"Optimization mathematics behind neural networks.",
coreStudies:
"Limits, derivatives, partial derivatives, gradients, chain rule, Jacobian, Hessian and optimization intuition.",
durationMinutes: 1080,
remarks: "",
isCompleted: false
},

{
id: "2-4",
title: "Optimization",
contents:
"How models actually learn.",
coreStudies:
"Gradient Descent, Batch Gradient Descent, SGD, Mini-batch, learning rate, momentum, Adam optimizer intuition.",
durationMinutes: 900,
remarks: "",
isCompleted: false
}

]
},
{
id: "row-3",
title: "3. Statistics & Probability",
timeline: "~55 Study Hours • Foundation for ML",
color: "#0f766e",
grids: [

{
id: "3-1",
title: "Probability Fundamentals",
contents:
"Probability theory forms the backbone of statistical machine learning.",
coreStudies:
"Sample space, events, conditional probability, independence, Bayes theorem, probability rules and intuition.",
durationMinutes: 900,
remarks: "",
isCompleted: false
},

{
id: "3-2",
title: "Descriptive Statistics",
contents:
"Understand how to summarize and interpret data.",
coreStudies:
"Mean, median, mode, variance, standard deviation, skewness, kurtosis, covariance and correlation.",
durationMinutes: 720,
remarks: "",
isCompleted: false
},

{
id: "3-3",
title: "Probability Distributions",
contents:
"Learn the distributions commonly used in AI and statistics.",
coreStudies:
"Bernoulli, Binomial, Gaussian, Uniform, Poisson, Exponential distributions and when they are applied.",
durationMinutes: 900,
remarks: "",
isCompleted: false
},

{
id: "3-4",
title: "Statistical Inference",
contents:
"Reason about data using statistical methods.",
coreStudies:
"Hypothesis testing, confidence intervals, p-values, likelihood, maximum likelihood estimation and sampling.",
durationMinutes: 780,
remarks: "",
isCompleted: false
}

]
},

{
id: "row-4",
title: "4. Software Engineering",
timeline: "~45 Study Hours • Professional Development",
color: "#ea580c",
grids: [

{
id: "4-1",
title: "Clean Code",
contents:
"Write readable, maintainable and scalable software.",
coreStudies:
"Naming conventions, code organization, refactoring, readability, maintainability and code smells.",
durationMinutes: 720,
remarks: "",
isCompleted: false
},

{
id: "4-2",
title: "Object-Oriented Programming",
contents:
"Master software design through objects.",
coreStudies:
"Classes, objects, inheritance, abstraction, encapsulation, polymorphism and composition.",
durationMinutes: 720,
remarks: "",
isCompleted: false
},

{
id: "4-3",
title: "SOLID Principles",
contents:
"Professional architecture principles used in industry.",
coreStudies:
"Single Responsibility, Open Closed, Liskov, Interface Segregation and Dependency Inversion.",
durationMinutes: 600,
remarks: "",
isCompleted: false
},

{
id: "4-4",
title: "Design Patterns",
contents:
"Reusable software architecture solutions.",
coreStudies:
"Factory, Singleton, Strategy, Observer, Adapter, Builder and Repository patterns.",
durationMinutes: 900,
remarks: "",
isCompleted: false
},

{
id: "4-5",
title: "Testing Fundamentals",
contents:
"Build confidence through automated testing.",
coreStudies:
"Unit testing, integration testing, mocking, assertions, debugging, test driven development fundamentals.",
durationMinutes: 720,
remarks: "",
isCompleted: false
}

]
},

{
id: "row-5",
title: "5. Databases",
timeline: "~45 Study Hours • Data Engineering Basics",
color: "#0891b2",
grids: [

{
id: "5-1",
title: "Relational Databases",
contents:
"Learn structured data storage.",
coreStudies:
"Tables, rows, columns, keys, normalization, constraints and relational modeling.",
durationMinutes: 720,
remarks: "",
isCompleted: false
},

{
id: "5-2",
title: "SQL",
contents:
"Master querying relational databases.",
coreStudies:
"SELECT, JOIN, GROUP BY, HAVING, subqueries, indexes, views, stored procedures and transactions.",
durationMinutes: 1080,
remarks: "",
isCompleted: false
},

{
id: "5-3",
title: "NoSQL Databases",
contents:
"Understand document-oriented storage.",
coreStudies:
"MongoDB architecture, collections, BSON, indexing, aggregation pipeline and schema design.",
durationMinutes: 720,
remarks: "",
isCompleted: false
},

{
id: "5-4",
title: "Database Performance",
contents:
"Learn why databases become slow.",
coreStudies:
"Indexes, query optimization, execution plans, caching, normalization vs denormalization and transactions.",
durationMinutes: 600,
remarks: "",
isCompleted: false
},

{
id: "5-5",
title: "Caching Systems",
contents:
"Improve performance using in-memory storage.",
coreStudies:
"Redis basics, cache invalidation, TTL, sessions, rate limiting and performance optimization.",
durationMinutes: 540,
remarks: "",
isCompleted: false
}

]
},

{
id: "row-6",
title: "6. Backend Engineering",
timeline: "~55 Study Hours • Building APIs",
color: "#2563eb",
grids: [

{
id: "6-1",
title: "Node.js Internals",
contents:
"Understand the runtime powering backend JavaScript.",
coreStudies:
"Event loop, worker threads, streams, buffers, modules, process lifecycle and memory.",
durationMinutes: 900,
remarks: "",
isCompleted: false
},

{
id: "6-2",
title: "Express.js",
contents:
"Build scalable backend APIs.",
coreStudies:
"Routing, middleware, controllers, services, validation, authentication and error handling.",
durationMinutes: 900,
remarks: "",
isCompleted: false
},

{
id: "6-3",
title: "Authentication & Security",
contents:
"Protect applications and user data.",
coreStudies:
"JWT, OAuth basics, bcrypt, sessions, CSRF, CORS, XSS, SQL Injection and secure authentication flows.",
durationMinutes: 960,
remarks: "",
isCompleted: false
},

{
id: "6-4",
title: "API Architecture",
contents:
"Design maintainable backend systems.",
coreStudies:
"RESTful design, versioning, pagination, filtering, rate limiting, logging and API documentation.",
durationMinutes: 720,
remarks: "",
isCompleted: false
}

]
},{
id: "row-7",
title: "7. Frontend Engineering",
timeline: "~50 Study Hours • Modern Web Development",
color: "#16a34a",
grids: [

{
id: "7-1",
title: "HTML & CSS Fundamentals",
contents:
"Understand how modern websites are structured and styled.",
coreStudies:
"Semantic HTML, accessibility, CSS box model, Flexbox, Grid, responsive design, media queries and CSS architecture.",
durationMinutes: 900,
remarks: "",
isCompleted: false
},

{
id: "7-2",
title: "Modern JavaScript & TypeScript",
contents:
"Write maintainable frontend applications.",
coreStudies:
"ES6+, modules, destructuring, spread operator, classes, TypeScript fundamentals, interfaces, generics and type safety.",
durationMinutes: 1080,
remarks: "",
isCompleted: false
},

{
id: "7-3",
title: "React Fundamentals",
contents:
"Build interactive user interfaces.",
coreStudies:
"Components, props, state, hooks, lifecycle, rendering, events, forms and component composition.",
durationMinutes: 1080,
remarks: "",
isCompleted: false
},

{
id: "7-4",
title: "Advanced React",
contents:
"Develop scalable frontend applications.",
coreStudies:
"Context API, reducers, routing, lazy loading, performance optimization, memoization, custom hooks and code splitting.",
durationMinutes: 900,
remarks: "",
isCompleted: false
},

{
id: "7-5",
title: "Frontend Architecture",
contents:
"Organize large React applications.",
coreStudies:
"Folder structure, reusable components, state management, API integration, authentication flow and frontend best practices.",
durationMinutes: 720,
remarks: "",
isCompleted: false
}

]
},

{
id: "row-8",
title: "8. Classical Machine Learning",
timeline: "~90 Study Hours • Machine Learning Core",
color: "#9333ea",
grids: [

{
id: "8-1",
title: "Machine Learning Fundamentals",
contents:
"Understand what machine learning is and how models learn.",
coreStudies:
"Supervised learning, unsupervised learning, reinforcement learning, features, labels, datasets, train/test split and bias-variance tradeoff.",
durationMinutes: 900,
remarks: "",
isCompleted: false
},

{
id: "8-2",
title: "Regression",
contents:
"Predict continuous numerical values.",
coreStudies:
"Linear Regression, Polynomial Regression, Multiple Regression, regularization intuition and evaluation metrics.",
durationMinutes: 900,
remarks: "",
isCompleted: false
},

{
id: "8-3",
title: "Classification",
contents:
"Predict categories from structured data.",
coreStudies:
"Logistic Regression, Decision Trees, Random Forest, Support Vector Machines, KNN and Naive Bayes.",
durationMinutes: 1080,
remarks: "",
isCompleted: false
},

{
id: "8-4",
title: "Clustering & Dimensionality Reduction",
contents:
"Discover patterns without labels.",
coreStudies:
"K-Means, Hierarchical Clustering, DBSCAN, PCA, feature reduction and visualization.",
durationMinutes: 900,
remarks: "",
isCompleted: false
},

{
id: "8-5",
title: "Model Evaluation",
contents:
"Measure model quality correctly.",
coreStudies:
"Accuracy, Precision, Recall, F1 Score, ROC Curve, AUC, Cross Validation, Confusion Matrix and overfitting detection.",
durationMinutes: 900,
remarks: "",
isCompleted: false
}

]
},

{
id: "row-9",
title: "9. Deep Learning",
timeline: "~95 Study Hours • Neural Networks",
color: "#dc2626",
grids: [

{
id: "9-1",
title: "Neural Networks",
contents:
"Understand the foundations of deep learning.",
coreStudies:
"Artificial neurons, perceptrons, multilayer perceptrons, forward propagation, weights, biases and activation functions.",
durationMinutes: 1080,
remarks: "",
isCompleted: false
},

{
id: "9-2",
title: "Training Neural Networks",
contents:
"Learn how neural networks optimize themselves.",
coreStudies:
"Loss functions, backpropagation, gradient descent, SGD, Adam optimizer, learning rate scheduling and initialization.",
durationMinutes: 1080,
remarks: "",
isCompleted: false
},

{
id: "9-3",
title: "Convolutional Neural Networks",
contents:
"Learn computer vision architectures.",
coreStudies:
"Convolution layers, filters, pooling, feature maps, image classification and CNN architectures.",
durationMinutes: 900,
remarks: "",
isCompleted: false
},

{
id: "9-4",
title: "Recurrent Neural Networks",
contents:
"Understand sequence modeling before transformers.",
coreStudies:
"RNN, LSTM, GRU, sequence learning, vanishing gradients and language modeling intuition.",
durationMinutes: 900,
remarks: "",
isCompleted: false
},

{
id: "9-5",
title: "Deep Learning Frameworks",
contents:
"Use modern deep learning libraries effectively.",
coreStudies:
"TensorFlow fundamentals, PyTorch fundamentals, tensors, datasets, dataloaders, GPU acceleration and training loops.",
durationMinutes: 900,
remarks: "",
isCompleted: false
}

]
},{
id: "row-10",
title: "10. Natural Language Processing",
timeline: "~80 Study Hours • Language Understanding",
color: "#7c3aed",
grids: [

{
id: "10-1",
title: "Text Processing Fundamentals",
contents:
"Learn how computers understand human language before introducing AI models.",
coreStudies:
"Unicode, UTF-8, text normalization, tokenization, stemming, lemmatization, stop words, punctuation handling, sentence segmentation and preprocessing pipelines.",
durationMinutes: 1080,
remarks: "",
isCompleted: false
},

{
id: "10-2",
title: "Vector Space Models",
contents:
"Represent text numerically for machine learning.",
coreStudies:
"Bag of Words, N-Grams, TF-IDF, document frequency, cosine similarity, sparse vectors and document ranking.",
durationMinutes: 960,
remarks: "",
isCompleted: false
},

{
id: "10-3",
title: "Word Embeddings",
contents:
"Learn semantic representations of words.",
coreStudies:
"Word2Vec, CBOW, Skip-Gram, GloVe, FastText, embedding spaces, semantic similarity and analogy reasoning.",
durationMinutes: 900,
remarks: "",
isCompleted: false
},

{
id: "10-4",
title: "Sequence Modeling",
contents:
"Understand language before transformers.",
coreStudies:
"Language models, sequence prediction, encoder-decoder intuition, sequence-to-sequence learning and contextual representations.",
durationMinutes: 840,
remarks: "",
isCompleted: false
}

]
},

{
id: "row-11",
title: "11. Transformers & Large Language Models",
timeline: "~95 Study Hours • Modern AI",
color: "#9333ea",
grids: [

{
id: "11-1",
title: "Attention Mechanism",
contents:
"The breakthrough that changed Natural Language Processing.",
coreStudies:
"Attention, self-attention, query, key, value, scaled dot-product attention and why attention outperforms recurrence.",
durationMinutes: 1080,
remarks: "",
isCompleted: false
},

{
id: "11-2",
title: "Transformer Architecture",
contents:
"Understand how modern LLMs are built.",
coreStudies:
"Encoder, decoder, positional encoding, multi-head attention, feed-forward layers, residual connections and layer normalization.",
durationMinutes: 1080,
remarks: "",
isCompleted: false
},

{
id: "11-3",
title: "Tokenization",
contents:
"Convert natural language into machine-readable tokens.",
coreStudies:
"Byte Pair Encoding (BPE), SentencePiece, WordPiece, token vocabularies, token IDs, context windows and token limits.",
durationMinutes: 840,
remarks: "",
isCompleted: false
},

{
id: "11-4",
title: "Embeddings",
contents:
"Represent language using dense vectors.",
coreStudies:
"Sentence embeddings, contextual embeddings, similarity search, embedding models, dimensionality and semantic meaning.",
durationMinutes: 900,
remarks: "",
isCompleted: false
},

{
id: "11-5",
title: "Large Language Models",
contents:
"Understand how modern AI assistants work.",
coreStudies:
"Pretraining, fine-tuning, instruction tuning, RLHF, inference, temperature, sampling, hallucinations and context management.",
durationMinutes: 1080,
remarks: "",
isCompleted: false
}

]
},

{
id: "row-12",
title: "12. AI Engineering",
timeline: "~75 Study Hours • Building AI Applications",
color: "#2563eb",
grids: [

{
id: "12-1",
title: "Prompt Engineering",
contents:
"Communicate effectively with language models.",
coreStudies:
"Prompt structure, role prompting, chain-of-thought concepts, few-shot prompting, zero-shot prompting, prompt evaluation and prompt optimization.",
durationMinutes: 720,
remarks: "",
isCompleted: false
},

{
id: "12-2",
title: "Structured Outputs",
contents:
"Generate reliable machine-readable responses.",
coreStudies:
"JSON outputs, schemas, validation, structured generation, constrained decoding and deterministic responses.",
durationMinutes: 600,
remarks: "",
isCompleted: false
},

{
id: "12-3",
title: "Function & Tool Calling",
contents:
"Allow LLMs to interact with software.",
coreStudies:
"Tool calling, function calling, API orchestration, external integrations, execution pipelines and tool selection.",
durationMinutes: 720,
remarks: "",
isCompleted: false
},

{
id: "12-4",
title: "Local AI Models",
contents:
"Run AI completely offline.",
coreStudies:
"Ollama, GGUF, llama.cpp, quantization basics, GPU vs CPU inference, model selection and local deployment.",
durationMinutes: 840,
remarks: "",
isCompleted: false
}

]
},{
id: "row-13",
title: "13. Retrieval Systems & Vector Databases",
timeline: "~80 Study Hours • Knowledge Retrieval",
color: "#0891b2",
grids: [

{
id: "13-1",
title: "Retrieval Fundamentals",
contents:
"Understand how AI retrieves knowledge instead of memorizing everything.",
coreStudies:
"Information retrieval, lexical search, semantic search, relevance ranking, BM25 intuition, hybrid search and retrieval pipelines.",
durationMinutes: 900,
remarks: "",
isCompleted: false
},

{
id: "13-2",
title: "Chunking Strategies",
contents:
"Prepare documents for retrieval efficiently.",
coreStudies:
"Fixed chunking, recursive chunking, semantic chunking, overlap, chunk size selection, metadata and preprocessing strategies.",
durationMinutes: 720,
remarks: "",
isCompleted: false
},

{
id: "13-3",
title: "Vector Databases",
contents:
"Store and retrieve embeddings efficiently.",
coreStudies:
"Vector indexes, embeddings storage, Pinecone concepts, ChromaDB, Qdrant, Milvus, FAISS fundamentals and metadata filtering.",
durationMinutes: 960,
remarks: "",
isCompleted: false
},

{
id: "13-4",
title: "Approximate Nearest Neighbor Search",
contents:
"Fast similarity search for millions of vectors.",
coreStudies:
"Brute force search, cosine similarity, Euclidean distance, dot product, ANN, HNSW, IVF, PQ and retrieval performance.",
durationMinutes: 960,
remarks: "",
isCompleted: false
},

{
id: "13-5",
title: "Retrieval-Augmented Generation (RAG)",
contents:
"Combine retrieval with language models for grounded responses.",
coreStudies:
"RAG pipeline, retrieval flow, reranking, context injection, hallucination reduction, citations and evaluation.",
durationMinutes: 1080,
remarks: "",
isCompleted: false
}

]
},

{
id: "row-14",
title: "14. AI Agents & Intelligent Systems",
timeline: "~70 Study Hours • Autonomous AI",
color: "#7c3aed",
grids: [

{
id: "14-1",
title: "Agent Fundamentals",
contents:
"Understand autonomous reasoning systems.",
coreStudies:
"Goals, planning, reasoning loops, decision making, agent architecture and execution lifecycle.",
durationMinutes: 720,
remarks: "",
isCompleted: false
},

{
id: "14-2",
title: "Memory Systems",
contents:
"Allow AI systems to remember information.",
coreStudies:
"Short-term memory, long-term memory, episodic memory, semantic memory, conversation history and memory retrieval.",
durationMinutes: 720,
remarks: "",
isCompleted: false
},

{
id: "14-3",
title: "Tool Integration",
contents:
"Expand AI capabilities through external tools.",
coreStudies:
"Function orchestration, API execution, search tools, calculator tools, database access and workflow execution.",
durationMinutes: 720,
remarks: "",
isCompleted: false
},

{
id: "14-4",
title: "Multi-Agent Systems",
contents:
"Coordinate multiple AI agents for complex workflows.",
coreStudies:
"Task delegation, planner agents, executor agents, communication, collaboration, orchestration and coordination.",
durationMinutes: 840,
remarks: "",
isCompleted: false
},

{
id: "14-5",
title: "Model Context Protocol (MCP)",
contents:
"Modern protocol for connecting AI systems to tools and resources.",
coreStudies:
"MCP architecture, clients, servers, resources, prompts, tools and secure integrations.",
durationMinutes: 720,
remarks: "",
isCompleted: false
}

]
},

{
id: "row-15",
title: "15. MLOps & Production AI",
timeline: "~65 Study Hours • Deploying AI Systems",
color: "#dc2626",
grids: [

{
id: "15-1",
title: "Docker",
contents:
"Package applications into portable containers.",
coreStudies:
"Images, containers, Dockerfiles, volumes, networking, Compose and deployment basics.",
durationMinutes: 900,
remarks: "",
isCompleted: false
},

{
id: "15-2",
title: "Cloud & Deployment",
contents:
"Deploy applications to production environments.",
coreStudies:
"Cloud fundamentals, Linux servers, Nginx, reverse proxy, domains, SSL, environment variables and deployment workflows.",
durationMinutes: 840,
remarks: "",
isCompleted: false
},

{
id: "15-3",
title: "CI/CD",
contents:
"Automate testing and deployment.",
coreStudies:
"GitHub Actions, pipelines, build automation, testing automation, deployment automation and release workflows.",
durationMinutes: 720,
remarks: "",
isCompleted: false
},

{
id: "15-4",
title: "Monitoring & Security",
contents:
"Maintain healthy and secure AI systems.",
coreStudies:
"Logging, monitoring, metrics, alerts, authentication, authorization, rate limiting, secrets management and observability.",
durationMinutes: 720,
remarks: "",
isCompleted: false
},

{
id: "15-5",
title: "AI Optimization",
contents:
"Improve inference performance.",
coreStudies:
"Quantization, batching, caching, GPU optimization, ONNX, inference optimization and latency reduction.",
durationMinutes: 840,
remarks: "",
isCompleted: false
}

]
},

{
id: "row-16",
title: "16. Research, Portfolio & Career Development",
timeline: "Continuous Learning • Entire Journey",
color: "#059669",
grids: [

{
id: "16-1",
title: "Research Papers",
contents:
"Learn directly from academic publications.",
coreStudies:
"Reading research papers, abstracts, methodology, experiments, benchmarks, reproducibility and scientific thinking.",
durationMinutes: 600,
remarks: "",
isCompleted: false
},

{
id: "16-2",
title: "Open Source Engineering",
contents:
"Learn from real production codebases.",
coreStudies:
"Reading repositories, contributing to GitHub, issue tracking, pull requests, documentation and software collaboration.",
durationMinutes: 600,
remarks: "",
isCompleted: false
},

{
id: "16-3",
title: "System Design",
contents:
"Design scalable AI-powered applications.",
coreStudies:
"Scalability, distributed systems, caching strategies, queues, architecture diagrams and engineering trade-offs.",
durationMinutes: 900,
remarks: "",
isCompleted: false
},

{
id: "16-4",
title: "Interview Preparation",
contents:
"Prepare for software engineering and AI engineering interviews.",
coreStudies:
"DSA review, ML concepts, LLM concepts, system design interviews, behavioral interviews and technical communication.",
durationMinutes: 720,
remarks: "",
isCompleted: false
},

{
id: "16-5",
title: "Continuous Learning",
contents:
"Develop the mindset of a lifelong engineer.",
coreStudies:
"Documentation, engineering blogs, release notes, conference talks, learning strategies and staying current with AI advancements.",
durationMinutes: 600,
remarks: "",
isCompleted: false
}

]
},
{
id: "row-17",
title: "17. Python AI Ecosystem",
timeline: "~40 Study Hours • Essential AI Development Tools",
color: "#f59e0b",
grids: [

{
id: "17-1",
title: "Python Virtual Environments",
contents:
"Learn to isolate project dependencies and maintain reproducible AI development environments.",
coreStudies:
"venv, virtualenv, environment activation, dependency isolation, requirements.txt, pyproject.toml and project organization.",
durationMinutes: 480,
remarks: "",
isCompleted: false
},

{
id: "17-2",
title: "Package Management",
contents:
"Understand modern Python package management for AI projects.",
coreStudies:
"pip, uv, package installation, dependency resolution, version pinning, package publishing and environment management.",
durationMinutes: 480,
remarks: "",
isCompleted: false
},

{
id: "17-3",
title: "NumPy",
contents:
"The numerical computing foundation of Machine Learning.",
coreStudies:
"ndarrays, indexing, slicing, broadcasting, vectorization, linear algebra operations, random module and numerical optimization.",
durationMinutes: 900,
remarks: "",
isCompleted: false
},

{
id: "17-4",
title: "Pandas",
contents:
"Manipulate, clean and analyze structured datasets efficiently.",
coreStudies:
"Series, DataFrames, indexing, filtering, grouping, joins, missing values, aggregation, feature engineering and CSV handling.",
durationMinutes: 900,
remarks: "",
isCompleted: false
},

{
id: "17-5",
title: "Matplotlib",
contents:
"Visualize datasets and machine learning results.",
coreStudies:
"Line charts, bar charts, scatter plots, histograms, subplots, customization, figure management and data visualization principles.",
durationMinutes: 600,
remarks: "",
isCompleted: false
},

{
id: "17-6",
title: "Jupyter Notebook",
contents:
"Interactive environment for experimentation, analysis and model development.",
coreStudies:
"Notebook workflow, Markdown, code cells, visualization, exploratory data analysis, reproducibility and interactive experimentation.",
durationMinutes: 420,
remarks: "",
isCompleted: false
},

{
id: "17-7",
title: "Scikit-learn",
contents:
"The standard machine learning library for classical ML.",
coreStudies:
"Datasets, preprocessing, pipelines, model training, regression, classification, clustering, evaluation metrics, cross-validation and hyperparameter tuning.",
durationMinutes: 1080,
remarks: "",
isCompleted: false
},

{
id: "17-8",
title: "Hugging Face Ecosystem",
contents:
"Explore the modern ecosystem for pretrained AI and language models.",
coreStudies:
"Transformers library, Datasets, Tokenizers, Pipelines, model loading, inference, fine-tuning concepts, model hub and safetensors.",
durationMinutes: 900,
remarks: "",
isCompleted: false
}

]
}
];