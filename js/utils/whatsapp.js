/**
 * WhatsApp Reminder & Notification Utility
 * Formats polite, professional gym management messages and generates direct `wa.me` links.
 */

export function generateWhatsAppReminderUrl(client, gymProfile) {
  const cleanPhone = (client.phone || '').replace(/[^0-9]/g, '');
  
  let message = "";
  if (client.feeStatus === "OVERDUE") {
    message = `⚡ *BODY ENGINEERS FIT CLUB* - Fee Payment Reminder
Hi ${client.fullName}! 👋

This is a gentle reminder from Body Engineers Fit Club regarding your membership fee of *${gymProfile.currency}${client.monthlyFee.toLocaleString('en-IN')}*.

📅 *Due Date:* ${client.nextFeeDueDate} (Currently Overdue)
💳 *UPI ID:* \`${gymProfile.upiId}\`

Please clear your dues today to keep your workout tracking and gym access uninterrupted. If already paid, please reply with your receipt screenshot!

Stay strong,
*${gymProfile.name}*`;
  } else if (client.feeStatus === "DUE_SOON") {
    message = `⚡ *BODY ENGINEERS FIT CLUB* - Upcoming Fee Due Alert
Hi ${client.fullName}! 👋

Hope you're crushing your workouts! Your gym membership renewal is coming up in a few days.

📅 *Next Due Date:* ${client.nextFeeDueDate}
💰 *Amount:* *${gymProfile.currency}${client.monthlyFee.toLocaleString('en-IN')}*
💳 *Quick UPI:* \`${gymProfile.upiId}\`

You can also renew directly at the front desk or via your member app. Thank you for being a committed member of our fit fam! 💪

Best regards,
*${gymProfile.name}*`;
  } else {
    message = `⚡ *BODY ENGINEERS FIT CLUB*
Hi ${client.fullName}! 👋

Your current membership is active and in good standing until *${client.nextFeeDueDate}*. Keep up the great consistency on your workout and diet goals! 🔥

*${gymProfile.name}*`;
  }

  const encodedMessage = encodeURIComponent(message);
  return `https://wa.me/${cleanPhone}?text=${encodedMessage}`;
}

export function generateDietShareUrl(client, dietPlan, gymProfile) {
  const cleanPhone = (client.phone || '').replace(/[^0-9]/g, '');
  const message = `🥗 *BODY ENGINEERS FIT CLUB* - Personalized Diet Chart for ${client.fullName}
🔥 Target Calories: ${dietPlan.dailyCalories} kcal
🥩 Protein: ${dietPlan.targetProteinG}g | 🍚 Carbs: ${dietPlan.targetCarbsG}g | 🥑 Fats: ${dietPlan.targetFatsG}g
💧 Daily Water Target: ${dietPlan.dailyWaterLiters} Liters

Check your complete timed meal schedule in your Body Engineers member portal!`;

  return `https://wa.me/${cleanPhone}?text=${encodeURIComponent(message)}`;
}
