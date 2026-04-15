require("dotenv").config();
const { sequelize, EventType, Availability, Booking, DateOverride } = require("./models");

async function seed() {
  try {
    await sequelize.sync({ force: true });
    console.log("Database tables created.");

    // --- Seed Event Types ---
    const event1 = await EventType.create({
      name: "30 Minute Meeting",
      duration: 30,
      slug: "30-min-meeting",
      color: "#0069ff",
      description: "A standard 30-minute meeting to discuss any topic.",
      location: "Google Meet",
    });

    const event2 = await EventType.create({
      name: "60 Minute Meeting",
      duration: 60,
      slug: "60-min-meeting",
      color: "#7b2ff7",
      description: "An in-depth 60-minute session for detailed discussions.",
      location: "Zoom",
    });

    const event3 = await EventType.create({
      name: "Quick Chat",
      duration: 15,
      slug: "quick-chat",
      color: "#ff5722",
      description: "A quick 15-minute call for brief check-ins.",
      location: "Phone Call",
    });

    console.log("Event types seeded.");

    // --- Seed Availability (Monday to Friday, 9 AM - 5 PM) ---
    const days = [
      { day_of_week: 0, is_available: false }, // Sunday
      { day_of_week: 1, is_available: true },  // Monday
      { day_of_week: 2, is_available: true },  // Tuesday
      { day_of_week: 3, is_available: true },  // Wednesday
      { day_of_week: 4, is_available: true },  // Thursday
      { day_of_week: 5, is_available: true },  // Friday
      { day_of_week: 6, is_available: false }, // Saturday
    ];

    await Availability.bulkCreate(
      days.map((d) => ({
        day_of_week: d.day_of_week,
        start_time: "09:00",
        end_time: "17:00",
        timezone: "Asia/Kolkata",
        is_available: d.is_available,
      }))
    );

    console.log("Availability seeded (Mon-Fri 9AM-5PM).");

    // --- Seed Date Override ---
    // Block a specific future date
    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + 10);
    const overrideDate = futureDate.toISOString().split("T")[0];

    await DateOverride.create({
      date: overrideDate,
      is_blocked: true,
    });

    console.log(`Date override seeded (${overrideDate} blocked).`);

    // --- Seed Sample Bookings ---
    // 3 upcoming bookings
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    // Find next weekday
    while (tomorrow.getDay() === 0 || tomorrow.getDay() === 6) {
      tomorrow.setDate(tomorrow.getDate() + 1);
    }

    const dayAfter = new Date(tomorrow);
    dayAfter.setDate(dayAfter.getDate() + 1);
    while (dayAfter.getDay() === 0 || dayAfter.getDay() === 6) {
      dayAfter.setDate(dayAfter.getDate() + 1);
    }

    const nextWeek = new Date(tomorrow);
    nextWeek.setDate(nextWeek.getDate() + 7);
    while (nextWeek.getDay() === 0 || nextWeek.getDay() === 6) {
      nextWeek.setDate(nextWeek.getDate() + 1);
    }

    await Booking.bulkCreate([
      {
        EventTypeId: event1.id,
        name: "John Doe",
        email: "john@example.com",
        date: tomorrow.toISOString().split("T")[0],
        time: "10:00",
        status: "booked",
        notes: "Let's discuss the quarterly goals.",
      },
      {
        EventTypeId: event2.id,
        name: "Jane Smith",
        email: "jane@example.com",
        date: dayAfter.toISOString().split("T")[0],
        time: "14:00",
        status: "booked",
        notes: "Product roadmap review.",
      },
      {
        EventTypeId: event3.id,
        name: "Alex Johnson",
        email: "alex@example.com",
        date: nextWeek.toISOString().split("T")[0],
        time: "11:00",
        status: "booked",
      },
    ]);

    // 2 past bookings
    const lastWeek = new Date();
    lastWeek.setDate(lastWeek.getDate() - 7);
    const lastWeek2 = new Date();
    lastWeek2.setDate(lastWeek2.getDate() - 3);

    await Booking.bulkCreate([
      {
        EventTypeId: event1.id,
        name: "Sarah Wilson",
        email: "sarah@example.com",
        date: lastWeek.toISOString().split("T")[0],
        time: "09:00",
        status: "booked",
        notes: "Onboarding session completed.",
      },
      {
        EventTypeId: event2.id,
        name: "Mike Brown",
        email: "mike@example.com",
        date: lastWeek2.toISOString().split("T")[0],
        time: "15:00",
        status: "booked",
      },
    ]);

    console.log("Sample bookings seeded.");

    console.log("\n✅ All seed data added successfully!");
    process.exit(0);
  } catch (err) {
    console.error("Seeding failed:", err.message);
    process.exit(1);
  }
}

seed();