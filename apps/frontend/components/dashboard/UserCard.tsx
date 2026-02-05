"use client";

import { Button } from "../ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../ui/dialog";
import type { AuthUser } from "@/context/types";

interface UserCardModalProps {
  user: AuthUser;
}

export default function UserCardModal({ user }: UserCardModalProps) {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline">Profile</Button>
      </DialogTrigger>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle>User Details</DialogTitle>
        </DialogHeader>
        <div className="space-y-2 mt-2">
          <p>
            <strong>Name:</strong> {user.name || "N/A"}
          </p>
          <p>
            <strong>Email:</strong> {user.email}
          </p>
          {typeof user.age === "number" && (
            <p>
              <strong>Age:</strong> {user.age}
            </p>
          )}
          {user.nationalID && (
            <p>
              <strong>ID:</strong> {user.nationalID}
            </p>
          )}
          <p>
            <strong>User UUID:</strong> {user.id}
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}
