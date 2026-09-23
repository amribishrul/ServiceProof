require("dotenv").config();

const mongoose = require("mongoose");

const connectDB = require("../config/db");
const Job = require("../models/Job");

const seedJobs = async () => {
  try {
    await connectDB();

    const testEmail = "amrishafi77@gmail.com";

    /*
    Remove existing demo ServiceProof jobs.
    This clears SRV-1001 through SRV-1020 so reseeding
    always gives us a clean testing dataset.
    */
    await Job.deleteMany({
      jobId: {
        $in: Array.from(
          { length: 20 },
          (_, index) =>
            `SRV-${1001 + index}`
        ),
      },
    });

    const jobs = [
      {
        jobId: "SRV-1001",
        technician: {
          id: "TECH-001",
          name: "Nimal Perera",
        },
        customer: {
          name: "Amri Shafi",
          email: testEmail,
        },
        product: "Washing Machine",
        reportedIssue:
          "Machine is not starting when the power button is pressed.",
        status: "ASSIGNED",
      },

      {
        jobId: "SRV-1002",
        technician: {
          id: "TECH-001",
          name: "Nimal Perera",
        },
        customer: {
          name: "Kasun Perera",
          email: testEmail,
        },
        product: "Refrigerator",
        reportedIssue:
          "Refrigerator is running but not cooling properly.",
        status: "ASSIGNED",
      },

      {
        jobId: "SRV-1003",
        technician: {
          id: "TECH-001",
          name: "Nimal Perera",
        },
        customer: {
          name: "Nadeesha Silva",
          email: testEmail,
        },
        product: "Air Conditioner",
        reportedIssue:
          "Water is leaking from the indoor unit.",
        status: "ASSIGNED",
      },

      {
        jobId: "SRV-1004",
        technician: {
          id: "TECH-001",
          name: "Nimal Perera",
        },
        customer: {
          name: "Dilshan Fernando",
          email: testEmail,
        },
        product: "Television",
        reportedIssue:
          "Television switches on but the screen remains black.",
        status: "ASSIGNED",
      },

      {
        jobId: "SRV-1005",
        technician: {
          id: "TECH-001",
          name: "Nimal Perera",
        },
        customer: {
          name: "Shanika Jayasinghe",
          email: testEmail,
        },
        product: "Microwave Oven",
        reportedIssue:
          "Microwave powers on but does not heat food.",
        status: "ASSIGNED",
      },

      {
        jobId: "SRV-1006",
        technician: {
          id: "TECH-001",
          name: "Nimal Perera",
        },
        customer: {
          name: "Ravindu Silva",
          email: testEmail,
        },
        product: "Water Dispenser",
        reportedIssue:
          "Cold water function is not working.",
        status: "ASSIGNED",
      },

      {
        jobId: "SRV-1007",
        technician: {
          id: "TECH-001",
          name: "Nimal Perera",
        },
        customer: {
          name: "Hashini Perera",
          email: testEmail,
        },
        product: "Dishwasher",
        reportedIssue:
          "Dishwasher stops before completing the wash cycle.",
        status: "ASSIGNED",
      },

      {
        jobId: "SRV-1008",
        technician: {
          id: "TECH-001",
          name: "Nimal Perera",
        },
        customer: {
          name: "Chamoda Fernando",
          email: testEmail,
        },
        product: "Electric Oven",
        reportedIssue:
          "Oven is not reaching the selected temperature.",
        status: "ASSIGNED",
      },

      {
        jobId: "SRV-1009",
        technician: {
          id: "TECH-001",
          name: "Nimal Perera",
        },
        customer: {
          name: "Themiya Bandara",
          email: testEmail,
        },
        product: "Ceiling Fan",
        reportedIssue:
          "Fan rotates slowly even at maximum speed.",
        status: "ASSIGNED",
      },

      {
        jobId: "SRV-1010",
        technician: {
          id: "TECH-001",
          name: "Nimal Perera",
        },
        customer: {
          name: "Janith Perera",
          email: testEmail,
        },
        product: "Vacuum Cleaner",
        reportedIssue:
          "Vacuum cleaner has very low suction power.",
        status: "ASSIGNED",
      },

      {
        jobId: "SRV-1011",
        technician: {
          id: "TECH-001",
          name: "Nimal Perera",
        },
        customer: {
          name: "Sahan Wickramasinghe",
          email: testEmail,
        },
        product: "Rice Cooker",
        reportedIssue:
          "Rice cooker does not switch to cooking mode.",
        status: "ASSIGNED",
      },

      {
        jobId: "SRV-1012",
        technician: {
          id: "TECH-001",
          name: "Nimal Perera",
        },
        customer: {
          name: "Tharushi Fernando",
          email: testEmail,
        },
        product: "Blender",
        reportedIssue:
          "Motor runs but the blades do not rotate.",
        status: "ASSIGNED",
      },

      {
        jobId: "SRV-1013",
        technician: {
          id: "TECH-001",
          name: "Nimal Perera",
        },
        customer: {
          name: "Dinuka Jayawardena",
          email: testEmail,
        },
        product: "Water Heater",
        reportedIssue:
          "Water heater is not producing hot water.",
        status: "ASSIGNED",
      },

      {
        jobId: "SRV-1014",
        technician: {
          id: "TECH-001",
          name: "Nimal Perera",
        },
        customer: {
          name: "Piumi Ranasinghe",
          email: testEmail,
        },
        product: "Coffee Machine",
        reportedIssue:
          "Coffee machine is leaking water during operation.",
        status: "ASSIGNED",
      },

      {
        jobId: "SRV-1015",
        technician: {
          id: "TECH-001",
          name: "Nimal Perera",
        },
        customer: {
          name: "Isuru Gunawardena",
          email: testEmail,
        },
        product: "Electric Kettle",
        reportedIssue:
          "Kettle does not automatically switch off.",
        status: "ASSIGNED",
      },

      {
        jobId: "SRV-1016",
        technician: {
          id: "TECH-001",
          name: "Nimal Perera",
        },
        customer: {
          name: "Sachini Perera",
          email: testEmail,
        },
        product: "Air Fryer",
        reportedIssue:
          "Air fryer fan is making an unusual noise.",
        status: "ASSIGNED",
      },

      {
        jobId: "SRV-1017",
        technician: {
          id: "TECH-001",
          name: "Nimal Perera",
        },
        customer: {
          name: "Akila Senanayake",
          email: testEmail,
        },
        product: "Chest Freezer",
        reportedIssue:
          "Freezer is forming excessive ice inside.",
        status: "ASSIGNED",
      },

      {
        jobId: "SRV-1018",
        technician: {
          id: "TECH-001",
          name: "Nimal Perera",
        },
        customer: {
          name: "Kavindi Silva",
          email: testEmail,
        },
        product: "Standing Fan",
        reportedIssue:
          "Fan oscillation function is not working.",
        status: "ASSIGNED",
      },

      {
        jobId: "SRV-1019",
        technician: {
          id: "TECH-001",
          name: "Nimal Perera",
        },
        customer: {
          name: "Malith Fernando",
          email: testEmail,
        },
        product: "Induction Cooker",
        reportedIssue:
          "Cooker displays an error and does not heat.",
        status: "ASSIGNED",
      },

      {
        jobId: "SRV-1020",
        technician: {
          id: "TECH-001",
          name: "Nimal Perera",
        },
        customer: {
          name: "Dulani Perera",
          email: testEmail,
        },
        product: "Water Pump",
        reportedIssue:
          "Water pump runs but pressure is very low.",
        status: "ASSIGNED",
      },
    ];

    const insertedJobs =
      await Job.insertMany(jobs);

    console.log("");
    console.log(
      `${insertedJobs.length} demo jobs created successfully.`
    );

    console.log(
      `All customer verification emails: ${testEmail}`
    );

    console.log(
      "All jobs are currently ASSIGNED."
    );

    console.log("");

    insertedJobs.forEach((job) => {
      console.log(
        `${job.jobId} | ${job.customer.name} | ${job.product} | ${job.status}`
      );
    });

    await mongoose.connection.close();

    process.exit(0);
  } catch (error) {
    console.error(
      "Failed to seed jobs:",
      error
    );

    await mongoose.connection.close();

    process.exit(1);
  }
};

seedJobs();