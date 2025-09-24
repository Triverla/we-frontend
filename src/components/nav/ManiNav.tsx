"use client";
import {
  Separator,
  Popover,
  PopoverContent,
  PopoverTrigger,
  Avatar,
  AvatarFallback,
  AvatarImage,
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  Button,
  Switch,
} from "@woothomes/components";
import { Menu, UserRound, MessageCircle } from "lucide-react";
import Link from "next/link";
import { useState, useEffect, useCallback } from "react";
import { SafeImage } from "@woothomes/components/ui/SafeImage";
import { useAuthStore } from "@woothomes/store";
import { useRouter, usePathname } from "next/navigation";
import { axiosBase } from "@woothomes/lib";
import { toast } from "sonner";
import { NotificationDropdown } from "../notifications/NotificationDropdown";

export function MainNav() {
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [isHostModalOpen, setIsHostModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [activeRole, setActiveRole] = useState<"guest" | "host">("guest");
  const [pendingOffersCount, setPendingOffersCount] = useState(0);
  const { user, resetAuth } = useAuthStore((state) => state);
  const router = useRouter();
  const pathname = usePathname();

  const isHostRoute = pathname.startsWith("/host");
  const isAuthenticated = !!user;
  const hasHostRole = user?.roles?.includes("host");
  const hasGuestRole = user?.roles?.includes("guest");
  const hasMultipleRoles = hasHostRole && hasGuestRole;

  // Set initial active role based on route
  useEffect(() => {
    // First check if there's a saved preference in localStorage
    const savedRole =
      typeof window !== "undefined"
        ? (localStorage.getItem("woothomes-active-role") as
            | "host"
            | "guest"
            | null)
        : null;

    if (
      savedRole &&
      ((savedRole === "host" && hasHostRole) ||
        (savedRole === "guest" && hasGuestRole))
    ) {
      // Use the saved role if it exists and the user has that role
      setActiveRole(savedRole);
    } else if (isHostRoute && hasHostRole) {
      // Otherwise, determine based on the current route
      setActiveRole("host");
      if (typeof window !== "undefined") {
        localStorage.setItem("woothomes-active-role", "host");
      }
    } else {
      setActiveRole("guest");
      if (typeof window !== "undefined") {
        localStorage.setItem("woothomes-active-role", "guest");
      }
    }
  }, [isHostRoute, hasGuestRole, hasHostRole]);

  // Wrap fetchPendingOffersCount in useCallback
  const fetchPendingOffersCount = useCallback(async () => {
    if (!user?.roles?.includes("host")) return;
    try {
      const response = await axiosBase.get("/offers/host", {
        params: {
          status: "pending",
          count_only: true,
        },
      });
      setPendingOffersCount(response.data.data?.length || 0);
    } catch (error: unknown) {
      console.error("Error fetching pending offers count:", error);
      setPendingOffersCount(0);
    }
  }, [user?.roles]);

  // Fetch pending offers count when user is a host
  useEffect(() => {
    if (user?.roles?.includes("host")) {
      fetchPendingOffersCount();
      // Set up polling for real-time updates
      const interval = setInterval(fetchPendingOffersCount, 30000); // Poll every 30 seconds
      return () => clearInterval(interval);
    }
  }, [user, fetchPendingOffersCount]);

  // Generate navigation links based on current role and state
  const getNavLinks = () => {
    // Links for host view
    const hostLinks = [
      { label: "Dashboard", href: "/host/dashboard" },
      { label: "Listings", href: "/host/listings" },
      {
        label: "Offers",
        href: "/host/offers",
        badge: pendingOffersCount > 0 ? pendingOffersCount : undefined,
      },
      { label: "Message", href: "/host/message" },
      { label: "Bookings", href: "/host/bookings" },
    ];

    // Public links that don't require authentication
    const publicLinks = [
      { label: "Home", href: "/" },
      { label: "About", href: "/about" },
      { label: "Properties", href: "/properties" },
    ];

    // Additional links that should only be visible to authenticated users
    const authenticatedLinks = [
      { label: "Dashboard", href: "/guest/dashboard", requiresAuth: true },
      { label: "Bookings", href: "/properties/booking", requiresAuth: true },
      { label: "Hourly Rentals", href: "/hourly-rentals" },
    ];

    // Generate the general links based on auth status
    const guestLinks = [
      ...publicLinks,
      ...authenticatedLinks.filter(
        (link) => !link.requiresAuth || isAuthenticated
      ),
    ];

    // Add host dashboard link to guest navigation when user is a host
    const guestNavLinks = hasHostRole ? [...guestLinks] : guestLinks;

    // Return the appropriate links based on active role
    return activeRole === "host" ? hostLinks : guestNavLinks;
  };

  // Generate the navigation links on demand instead of relying on state changes
  const navLinks = getNavLinks();

  const handleLogout = async () => {
    // Immediately reset auth state and redirect
    resetAuth();
    router.push("/");

    // Make the API call in the background
    try {
      await axiosBase.post("/auth/logout");
    } catch (error) {
      console.error("Logout API call failed:", error);
      // Don't show error to user since they're already logged out locally
    }
  };

  const handleBecomeHost = async () => {
    setIsLoading(true);
    try {
      const response = await axiosBase.post("/profile/become-host");

      // Check if the API returned an updated user object
      if (response?.data?.data?.user) {
        // Use the user data from the API response if available
        const updatedUser = response.data.data.user;
        useAuthStore.getState().setState({ user: updatedUser });
      } else {
        // Fallback: Update local state with new host role
        if (user) {
          const updatedRoles = [...user.roles];
          if (!updatedRoles.includes("host")) {
            updatedRoles.push("host");
          }

          // Create updated user object with new roles
          const updatedUser = {
            ...user,
            roles: updatedRoles,
          };

          // Update the auth store
          useAuthStore.getState().setState({ user: updatedUser });
        }
      }

      // Update the active role and save preference
      setActiveRole("host");
      if (typeof window !== "undefined") {
        localStorage.setItem("woothomes-active-role", "host");
      }

      // toast.success(response?.data?.message || "You are now a host!");
      // Redirect to host dashboard
      router.push("/host/dashboard");
    } catch (error: unknown) {
      const errorMsg =
        error && typeof error === "object" && "response" in error
          ? error.response &&
            typeof error.response === "object" &&
            "data" in error.response
            ? error.response.data &&
              typeof error.response.data === "object" &&
              "message" in error.response.data
              ? (error.response.data.message as string)
              : "Failed to become a host. Please try again."
            : "Failed to become a host. Please try again."
          : "Failed to become a host. Please try again.";

      toast.error(errorMsg);
    } finally {
      setIsLoading(false);
      setIsHostModalOpen(false);
    }
  };

  const handleBookingsClick = (
    e: React.MouseEvent<HTMLAnchorElement>,
    href: string
  ) => {
    // If the link is for bookings and user is not authenticated, prevent default navigation
    if (href === "/properties/booking" && !isAuthenticated) {
      e.preventDefault();
      toast.error("Please sign in to view your bookings");
      router.push("/auth/signin");
    }
  };

  const handleRoleSwitch = (href: string) => {
    if (href === "/host/dashboard") {
      setActiveRole("host");
      if (typeof window !== "undefined") {
        localStorage.setItem("woothomes-active-role", "host");
      }
      router.push("/host/dashboard");
    } else if (href === "/") {
      setActiveRole("guest");
      if (typeof window !== "undefined") {
        localStorage.setItem("woothomes-active-role", "guest");
      }
      router.push("/");
    }
  };

  const handleSwitchToggle = (checked: boolean) => {
    const newRole = checked ? "host" : "guest";
    setActiveRole(newRole);
    if (typeof window !== "undefined") {
      localStorage.setItem("woothomes-active-role", newRole);
    }
    router.push(checked ? "/host/dashboard" : "/");
  };

  return (
    <header className="bg-[#0c2d84] text-white px-8 sm:px-14 py-4 flex flex-col items-center w-full">
      <nav className="flex justify-between items-center w-full">
        {/* Logo */}
        <div className="flex items-center">
          <div className="items-center">
            <SafeImage
              width={150}
              height={150}
              src="/woothomes.svg"
              alt="Modern luxury accommodation"
              className="cursor-pointer"
              priority
              onClick={() => router.push("/")}
            />
          </div>
        </div>

        {/* Desktop Nav */}
        <ul className="hidden xl:flex items-center space-x-12">
          {navLinks.map(
            ({
              label,
              href,
              badge,
            }: {
              label: string;
              href: string;
              badge?: number;
            }) => (
              <li key={`${label}-${href}`} className="relative">
                <Link
                  href={href}
                  className={`text-sm hover:underline whitespace-nowrap flex items-center ${
                    pathname === href ? "text-blue-300 font-medium" : ""
                  }`}
                  onClick={(e) => {
                    if (
                      label === "Switch to Host View" ||
                      label === "Switch to Guest View"
                    ) {
                      handleRoleSwitch(href);
                    } else {
                      handleBookingsClick(e, href);
                    }
                  }}
                >
                  {label}
                  {badge && badge > 0 && (
                    <span className="ml-2 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                      {badge}
                    </span>
                  )}
                </Link>
              </li>
            )
          )}
        </ul>

        {/* Right Actions */}
        <div className="flex items-center">
          {/* Role Switcher for users with host role or dual roles */}
          {(hasHostRole || hasMultipleRoles) && (
            <div className="hidden md:flex items-center mr-6 bg-opacity-20 bg-white text-black rounded-full px-3 py-1">
              <span
                className={`text-xs mr-2 ${
                  activeRole === "guest" ? "font-bold" : "opacity-70"
                }`}
              >
                Guest
              </span>
              <Switch
                checked={activeRole === "host"}
                onCheckedChange={handleSwitchToggle}
              />
              <span
                className={`text-xs ml-2 ${
                  activeRole === "host" ? "font-bold" : "opacity-70"
                }`}
              >
                Host
              </span>
            </div>
          )}

          {/* Become a Host button for non-host users */}
          {!hasHostRole && isAuthenticated && (
            <button
              onClick={() => setIsHostModalOpen(true)}
              className="hidden md:block text-sm hover:underline mr-4 whitespace-nowrap text-white"
            >
              Become a Host
            </button>
          )}

          {/* Become a Host link for unauthenticated users */}
          {!hasHostRole && !isAuthenticated && (
            <Link
              href="/auth/host/signup"
              prefetch={true}
              className="hidden md:block text-sm hover:underline mr-4 whitespace-nowrap text-white"
            >
              Become a Host
            </Link>
          )}

          {/* User Avatar Dropdown */}
          <div className="flex gap-4 items-center justify-center">
            {/* Message Icon */}
            {user && (
              <Link
                href={user?.roles?.includes("guest")
                  ? "/guest/message"
                  : "/host/message"}
                className="relative p-2 text-white hover:text-blue-300 transition-colors"
              >
                <MessageCircle className="w-5 h-5" />
              </Link>
            )}
            
            {user && <NotificationDropdown />}

            <Popover open={isUserMenuOpen} onOpenChange={setIsUserMenuOpen}>
              <PopoverTrigger asChild>
                <div className="flex items-center bg-muted rounded-2xl px-3 py-1 cursor-pointer">
                  <Menu className="text-[#111827] w-5 h-5" />
                  {user && (
                    <Avatar>
                      <AvatarImage src={user.avatar || "/user.png"} />
                      <AvatarFallback>
                        <UserRound className="w-5 h-5 bg-[#D1D5DB] rounded-2xl" />
                      </AvatarFallback>
                    </Avatar>
                  )}
                </div>
              </PopoverTrigger>

              <PopoverContent className="w-48 mt-2 p-2 bg-white rounded-lg shadow-lg">
                {/* Mobile Nav Links - Generate them at render time */}
                <div className="block xl:hidden">
                  {navLinks.map(({ label, href }) => (
                    <Link
                      key={`mobile-${label}-${href}`}
                      href={href}
                      className="block py-2 px-2 text-sm text-gray-900 hover:bg-gray-100 hover:text-gray-900 rounded"
                      onClick={(e) => handleBookingsClick(e, href)}
                    >
                      {label}
                    </Link>
                  ))}
                </div>

                {/* User Info + Actions */}
                {user ? (
                  <>
                    <div className="px-2 py-2 text-sm text-gray-700 font-medium">
                      {user.name}
                      {hasMultipleRoles && (
                        <span className="ml-2 text-xs bg-blue-100 text-blue-800 px-2 py-0.5 rounded-full">
                          {activeRole === "host" ? "Host" : "Guest"}
                        </span>
                      )}
                    </div>
                    <Separator className="my-2" />

                    {/* Role Switcher for Mobile */}
                    {hasMultipleRoles && (
                      <div className="block xl:hidden px-2 py-2">
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-gray-700">
                            Switch to{" "}
                            {activeRole === "guest" ? "Host" : "Guest"}
                          </span>
                          <Switch
                            checked={activeRole === "host"}
                            onCheckedChange={handleSwitchToggle}
                          />
                        </div>
                        <Separator className="my-2" />
                      </div>
                    )}

                    <Link
                      href={"/account"}
                      className="block py-2 px-2 text-sm text-gray-900 hover:bg-gray-100 rounded"
                    >
                      My Account
                    </Link>
                    <div
                      onClick={handleLogout}
                      className="cursor-pointer block py-2 px-2 text-sm text-gray-900 hover:bg-gray-100 rounded"
                    >
                      Sign Out
                    </div>
                  </>
                ) : (
                  <>
                    <Link
                      href="/auth/signin"
                      className="block py-2 px-2 text-sm text-gray-900 hover:bg-gray-100 rounded"
                    >
                      Sign In
                    </Link>
                    <Link
                      href="/auth/signup"
                      className="block py-2 px-2 text-sm text-gray-900 hover:bg-gray-100 rounded"
                    >
                      Sign Up
                    </Link>
                  </>
                )}

                <Separator className="my-2" />
                <Link
                  href="#"
                  className="block py-2 px-2 text-sm text-gray-900 hover:bg-gray-100 rounded"
                >
                  Get Help
                </Link>
              </PopoverContent>
            </Popover>
          </div>
        </div>
      </nav>

      {/* Become Host Confirmation Modal */}
      <Dialog open={isHostModalOpen} onOpenChange={setIsHostModalOpen}>
        <DialogContent className="sm:max-w-md rounded-lg border-0 shadow-lg bg-white">
          <DialogHeader className="pb-4">
            <DialogTitle className="text-2xl font-bold text-blue-500">
              Become a Host
            </DialogTitle>
            <DialogDescription className="text-gray-600 mt-2">
              You&apos;re about to become a host on Woothomes. As a host,
              you&apos;ll be able to list your properties and earn money by
              renting them out.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4 border-t border-b border-gray-100">
            <div className="space-y-4">
              <h3 className="font-medium text-gray-900">What happens next?</h3>
              <ul className="space-y-2 pl-5 list-disc text-sm text-gray-600">
                <li>You&apos;ll go through our host onboarding process</li>
                <li>
                  You&apos;ll be able to list your properties and set your own
                  prices
                </li>
                <li>
                  You&apos;ll receive bookings from guests around the world
                </li>
                <li>
                  You&apos;ll have access to host-specific tools and analytics
                </li>
              </ul>
            </div>
          </div>
          <DialogFooter className="flex justify-end gap-2 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsHostModalOpen(false)}
              className="border-blue-500 hover:bg-blue-50 bg-white text-blue-600"
            >
              Cancel
            </Button>
            <Button
              type="button"
              className="bg-blue-500 text-white hover:bg-blue-700 transition-colors"
              onClick={handleBecomeHost}
              disabled={isLoading}
            >
              {isLoading ? (
                <div className="flex items-center gap-2">
                  <svg
                    className="animate-spin h-5 w-5 text-white"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8v8z"
                    ></path>
                  </svg>
                  <span>Processing...</span>
                </div>
              ) : (
                "Continue"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </header>
  );
}
