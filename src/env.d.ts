/// <reference types="astro/client" />
/// <reference types="@auth/core" />

declare namespace App {
  interface Locals {
    user?: {
      userId: number;
      email: string;
      isAdmin: boolean;
    };
  }
}
