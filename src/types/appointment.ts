export type AppointmentStatusObject = {
  pending: string;
  rescheduled: string;
  edited: string;
  approved: string;
  cancelled: string;
  done: string;
};

export type TAppointmentStatus = {
  appointmentStatusId: string;
  appointmentId: String;
  status: string;
  createdAt: string;
  updatedAt: string;
};
