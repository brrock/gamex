type WebhookEventData =
  | {
      id: string;
      username: string;
      profile_image_url: string;
    }
  | DeletedObjectJSON
  | SessionJSON
  | EmailJSON
  | SMSMessageJSON
  | OrganizationJSON
  | OrganizationMembershipJSON
  | OrganizationInvitationJSON;

type WebhookEvent = {
  type: string;
  data: WebhookEventData;
};
