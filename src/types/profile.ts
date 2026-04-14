export interface Profile {
  id: string;
  familyId: string;
  name: string;
  color: string;
  monthlyIncome: number;
  role: "owner" | "member";
  status: "active" | "invited";
  inviteEmail?: string;
  avatarEmoji?: string;
  avatarImage?: string;
  createdAt: string;
  updatedAt: string;
}
