export type TVideoChatMessage = {
  message: string;
  userId: string;
  createdAt: string;
};

export type TVideoConference = {
  videoConferenceId: string;
  hostId: string;
  attendeeId: string;
  userPeerId: string;
  userId: string;
  createdAt: string;
  updatedAt: string;
};
