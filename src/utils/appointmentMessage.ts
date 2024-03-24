export class AppointmentMessage {
  private name: string;
  private appointmentDate: string;
  private appointmentStartTime: string;
  private appointmentEndTime: string;

  constructor(name: string, startsAt: Date, endsAt: Date) {
    this.name = name;
    this.appointmentDate = startsAt.toDateString();
    this.appointmentStartTime = startsAt.toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });
    this.appointmentEndTime = endsAt.toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });
  }

  appointmentScheduled() {
    return `New Appointment Alert: ${this.name} - Date & Time: ${this.appointmentDate}
     from ${this.appointmentStartTime}-${this.appointmentEndTime}. Please confirm your 
     availability. We look forward to meeting with you.`;
  }

  appointmentRescheduled() {
    return `Appointment Rescheduled: ${this.name} - Date & Time: ${this.appointmentDate}
     from ${this.appointmentStartTime}-${this.appointmentEndTime}. Please acknowledge
     this change. Thank you.`;
  }

  appointmentEdited() {
    return `Appointment Edited: ${this.name} - Date & Time: ${this.appointmentDate}
      from ${this.appointmentStartTime}-${this.appointmentEndTime}.Please review the
      changes and confirm your availability. Thank you.`;
  }

  appointmentApproved() {
    return `Appointment Approved: ${this.name} - Date & Time: ${this.appointmentDate}
        from ${this.appointmentStartTime}-${this.appointmentEndTime}.Your appointment 
        has been successfully approved. We look forward to seeing you at the
        scheduled time. Thank you.`;
  }

  appointmentCancelled() {
    return `Appointment Cancelled: ${this.name} - Date & Time: ${this.appointmentDate}
       from ${this.appointmentStartTime}-${this.appointmentEndTime}. We regret to inform 
       you that your appointment has been cancelled. If you need to reschedule, 
       please contact us at your earliest convenience. 
       Thank you for your understanding`;
  }
  appointmentDeleted() {
    return `Appointment Deleted: ${this.name} - Date & Time: ${this.appointmentDate}
       from ${this.appointmentStartTime}-${this.appointmentEndTime}. The appointment
       was scheduled with you has been deleted. We kindly inform you to adjust
       your schedule accordingly. Thank you for your understanding.`;
  }
}
