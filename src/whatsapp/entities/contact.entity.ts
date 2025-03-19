export class ContactWS {
  id: string;
  name: string | undefined;
  number: string;
  profilePicUrl?: string;
  shortName: string | undefined;
  isBusiness: boolean;
  status?: string;
  isMyContact?: boolean;
  isBlocked?: boolean;
  isWAContact?: boolean;
}
