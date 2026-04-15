function generateSlots(start, end, duration) {
  const slots = [];

  let [startHour, startMin] = start.split(":").map(Number);
  let [endHour, endMin] = end.split(":").map(Number);

  let current = startHour * 60 + startMin;
  const endTime = endHour * 60 + endMin;

  while (current + duration <= endTime) {
    const hours = Math.floor(current / 60);
    const mins = current % 60;

    const formatted = `${String(hours).padStart(2, "0")}:${String(mins).padStart(2, "0")}`;
    slots.push(formatted);

    current += duration;
  }

  return slots;
}

module.exports = generateSlots;