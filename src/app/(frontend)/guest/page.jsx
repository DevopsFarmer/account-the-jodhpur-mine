// This page allows a guest to add a new account, reusing the AddClientAccount logic/UI
import React from "react";
import AddClientAccount from "../client/account/add/page";

export default function AddAccountPage() {
  // Optionally, you could pass props or context to AddClientAccount to adjust for guest-specific logic
  return <AddClientAccount isGuest />;
}
