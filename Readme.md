# TrueCare AI - Healthcare Reimbursement Solution

TrueCare AI revolutionizes healthcare reimbursement by harnessing AI-powered machine learning to streamline claims processing, analyze medical documents, and ensure compliance while detecting fraud. Built with the MERN stack (MongoDB, Express.js, React, Node.js), this application delivers speed, accuracy, and trust for healthcare providers, insurers, and patients. TrueCare AI processes client information, insurance policies, and legal regulations to predict accurate reimbursement amounts, enhancing efficiency and transparency in the healthcare ecosystem.

## Machine Learning Component

The machine learning core of TrueCare AI, housed in the `ML/` directory, drives intelligent claims processing and fraud detection. The `main.py` script integrates models trained on medical documents and reimbursement data, leveraging libraries listed in `requirements.txt`. This component analyzes patterns in claims, validates compliance with regulations, and flags anomalies, ensuring accurate predictions and minimizing fraudulent activity.

## API Component

The API, located in the `api/` directory, serves as the backbone for secure data handling and communication. Built with Node.js and Express.js (`server.js`), it includes controllers (`doctorController.js`, `insurerController.js`) and models (`Doctor.js`, `Insurer.js`, `MedicalBulletin.js`, `User.js`) to manage interactions between doctors, insurers, and system users. Routes (`doctor.js`, `insurer.js`) facilitate CRUD operations, while `auth.js` middleware ensures secure authentication and authorization. The API connects the client interface to the machine learning backend, delivering processed reimbursement data and compliance insights in real-time.

## Client Component

The client-side application, found in the `client/` directory, provides an intuitive React-based interface for users. Components like `DoctorDashboard.jsx`, `InsurerDashboard.jsx`, `ClientPage.jsx`, and `AddClientForm.jsx` cater to specific user roles, enabling doctors to submit claims, insurers to review policies, and administrators to manage client data. The `HomePage.jsx` and `navbar.jsx` ensure seamless navigation. Tailwind CSS (`tailwind.config.js`) and Vite (`vite.config.js`) power a responsive, modern frontend, with `api.js` handling API requests to fetch and display reimbursement insights.

## Test Component

The `test/` directory ensures the reliability of TrueCare AI through comprehensive testing. The API tests, housed in `test/api/`, include `auth.test.js` to verify authentication logic, configured via `jest.config.js`. Client-side tests in `test/client/`, such as `AuthComponents.test.jsx`, validate critical UI components like `DoctorAuth.jsx` and `InsurerAuth.jsx`. These tests, supported by Jest and other dependencies in `package.json`, cover functionality, security, and user interactions, ensuring the application performs robustly across real-world healthcare reimbursement scenarios.


<p align="center">
  <img src="./client/src/assets/1.png" alt="Project Snapshot" width="600" />
</p>




