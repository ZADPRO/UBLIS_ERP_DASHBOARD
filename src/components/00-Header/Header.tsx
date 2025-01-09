import { useState, ReactNode, useEffect, useRef } from "react";
import { motion } from "framer-motion";

import { SlOrganization } from "react-icons/sl";

import { IoIosLogOut, IoMdMenu } from "react-icons/io";

import { NavLink, useLocation, useNavigate } from "react-router-dom";

import "./Header.css";
import Expired from "../../pages/Expired/Expired";
// import UserDashboard from "../../pages/01-UserDashboard/UserDashboard";
import { Sidebar } from "primereact/sidebar";
import { Button } from "primereact/button";
import { Divider } from "primereact/divider";
import {
  ArrowRightLeft,
  CircleUser,
  FileClock,
  FileStack,
  Headset,
  IndianRupee,
  LayoutGrid,
  PencilLine,
  LibraryBig,
  ListChecks,
  LogOut,
  TriangleAlert,
  Settings,
  ChartNoAxesCombined,
  MessageCircle,
  UserRoundPen,
  IdCard,
  NotebookPen,
  Split,
  SquareUserRound,
  User,
  UserPlus,
  UserRoundCheck,
  UserRoundPlus,
} from "lucide-react";
import { Ripple } from "primereact/ripple";
import { Toast } from "primereact/toast";

// Define types for the route structure
interface Route {
  path: string;
  name: string;
  icon: JSX.Element;
}

const Header: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [routes, setRoutes] = useState<Route[]>([]);

  const navigate = useNavigate();
  const toast = useRef<Toast>(null);
  const showWarn = () => {
    toast.current?.show({
      severity: "info",
      summary: "Warning",
      detail: "Coming Soon !!!",
      life: 3000,
    });
    setUserNavbarVisible(false);
  };

  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768); // Set mobile view if width <= 768px
    };

    handleResize(); // Check initial screen size
    window.addEventListener("resize", handleResize); // Add resize listener

    return () => {
      window.removeEventListener("resize", handleResize); // Clean up listener
    };
  }, []);

  const [visible, setVisible] = useState(false);

  const [userMobileNavbarVisibe, setUserNavbarVisible] = useState(false);

  const utId = localStorage.getItem("refUtId");

  // Define the routes based on refUtId
  const userRoutes: Route[] = [
    { path: "/users/dashboard", name: "Dashboard", icon: <LayoutGrid /> },
    {
      path: "/users/attendance",
      name: "Attendance",
      icon: <LibraryBig />,
    },
    { path: "/users/notes", name: "User Notes", icon: <ListChecks /> },
    { path: "/users/payment", name: "Payment", icon: <IndianRupee /> },
    { path: "/users/branch", name: "Branch", icon: <Split /> },
    { path: "/users/profile", name: "Profile", icon: <User /> },
    {
      path: "/users/support",
      name: "Support",
      icon: <Headset />,
    },
    { path: "/logout", name: "Logout", icon: <LogOut /> },
  ];

  const staffRoutes: Route[] = [
    {
      path: "/staff/Dashboard",
      name: "Dashboard",
      icon: <LayoutGrid />,
    },
    {
      path: "/staff/users",
      name: "All Users",
      icon: <User />,
    },
    {
      path: "/staff/registeredUsers",
      name: "Trial & Fee Due",
      icon: <User />,
    },
    {
      path: "/staff/attendance",
      name: "Attendance",
      icon: <LibraryBig />,
    },
    {
      path: "/staff/signedupUsers",
<<<<<<< HEAD
      name: "Future Clients", 
=======
      name: "Future Clients",
>>>>>>> c9d0386b317eaf99c858aaae047f1d6b9d60220f
      icon: <UserRoundCheck />,
    },
    {
      path: "/staff/feedback",
      name: "Feedback",
      icon: <MessageCircle />,
    },
    { path: "/users/profile", name: "Profile", icon: <UserRoundPen /> },
    {
      path: "/users/support",
      name: "Support",
      icon: <Headset />,
    },
    { path: "/logout", name: "Logout", icon: <IoIosLogOut /> },
  ];

  const directorRoutes: Route[] = [
    {
      path: "/staff/Dashboard",
      name: "Dashboard",
      icon: <LayoutGrid />,
    },
    {
      path: "/staff/users",
      name: "All Users",
      icon: <CircleUser />,
    },
    {
      path: "/therapist/approve",
      name: "Registered Users",
      icon: <UserRoundCheck />,
    },
    {
      path: "/staff/registeredUsers",
      name: "Trial & Fee Due",
      icon: <UserRoundPlus />,
    },
    {
      path: "/staff/payment",
      name: "Payment",
      icon: <IndianRupee />,
    },
    {
      path: "/staff/attendance",
      name: "Attendance",
      icon: <LibraryBig />,
    },

    {
      path: "/staff/signedupUsers",
      name: "Future Clients",
      icon: <UserPlus />,
    },

    {
      path: "/dir/staff",
      name: "Staff / Employee",
      icon: <SquareUserRound />,
    },
    {
      path: "/dir/notify",
      name: "User Audit Page",
      icon: <FileClock />,
    },
    {
      path: "/yoganotes",
      name: "Add Notes",
      icon: <ListChecks />,
    },
    {
      path: "/assignnotes",
      name: "Assign Notes",
      icon: <FileStack />,
    },
    {
      path: "/staff/transaction",
      name: "Transactions",
      icon: <ArrowRightLeft />,
    },
    {
      path: "/staff/feedback",
      name: "Feedback",
      icon: <MessageCircle />,
    },

    {
      path: "/staff/payroll",
      name: "Payroll",
      icon: <IdCard />,
    },
    {
      path: "/reports",
      name: "Reports",
      icon: <ChartNoAxesCombined />,
    },
    { path: "/blogs", name: "Blogs", icon: <NotebookPen /> },
    { path: "/editNotes", name: "Directors - Notes", icon: <PencilLine /> },
    {
      path: "/restrictions",
      name: "Directors - Restrictions",
      icon: <TriangleAlert />,
    },
    {
      path: "/dir/organization",
      name: "Organization Chart",
      icon: <SlOrganization />,
    },
    { path: "/users/profile", name: "Profile", icon: <UserRoundPen /> },
    { path: "/settings", name: "Settings", icon: <Settings /> },
    {
      path: "/users/support",
      name: "Support",
      icon: <Headset />,
    },
    { path: "/logout", name: "Logout", icon: <LogOut /> },
  ];

  const financeRoutes: Route[] = [
    {
      path: "/staff/Dashboard",
      name: "Dashboard",
      icon: <LayoutGrid />,
    },
    {
      path: "/staff/transaction",
      name: "Transactions",
      icon: <ArrowRightLeft />,
    },
    {
      path: "/staff/payroll",
      name: "Payroll",
      icon: <IdCard />,
    },
    {
      path: "/reports",
      name: "Reports",
      icon: <ChartNoAxesCombined />,
    },
    { path: "/users/profile", name: "Profile", icon: <UserRoundPen /> },
    {
      path: "/users/support",
      name: "Support",
      icon: <Headset />,
    },
    { path: "/logout", name: "Logout", icon: <IoIosLogOut /> },
  ];

  const therapist: Route[] = [
    {
      path: "/staff/Dashboard",
      name: "Dashboard",
      icon: <LayoutGrid />,
    },
    {
      path: "/staff/users",
      name: "All Users",
      icon: <User />,
    },
    // {
    //   path: "/staff/registeredUsers",
    //   name: "Trial & Fee Due Users",
    //   icon: <User />,
    // },
    // {
    //   path: "/staff/signedupUsers",
    //   name: "Future Clients",
    //   icon: <UserRoundCheck  />,
    // },
    {
      path: "/therapist/approve",
      name: "Registered Users",
      icon: <UserRoundCheck />,
    },
    // {
    //   path: "/dir/staff",
    //   name: "Staff / Employee",
    //   icon: <SquareUserRound  />,
    // },
    {
      path: "/staff/feedback",
      name: "Feedback",
      icon: <MessageCircle />,
    },
    // {
    //   path: "/staff/transaction",
    //   name: "Transactions",
    //   icon: <ArrowRightLeft />,
    // },
    // {
    //   path: "/staff/payroll",
    //   name: "Payroll",
    //   icon: <IdCard />,
    // },
    // {
    //   path: "/reports",
    //   name: "Directors - Reports",
    //   icon: <ChartNoAxesCombined />,
    // },
    // { path: "/blogs", name: "Directors - Blogs", icon: <NotebookPen  /> },
    // { path: "/editNotes", name: "Directors - Notes", icon: <PencilLine /> },
    // {
    //   path: "/restrictions",
    //   name: "Directors - Restrictions",
    //   icon: <TriangleAlert />,
    // },
    // {
    //   path: "/dir/organization",
    //   name: "Organization Chart",
    //   icon: <SlOrganization />,
    // },
    { path: "/users/profile", name: "Profile", icon: <UserRoundPen /> },
    {
      path: "/users/support",
      name: "Support",
      icon: <Headset />,
    },
    { path: "/logout", name: "Logout", icon: <IoIosLogOut /> },
  ];

  useEffect(() => {
    const parsedUtId = utId ? parseInt(utId, 10) : null;

    if (parsedUtId === 5 || parsedUtId === 6) {
      setRoutes(userRoutes);
    } else if (parsedUtId === 4) {
      setRoutes(staffRoutes);
    } else if (parsedUtId === 7) {
      setRoutes(directorRoutes);
    } else if (parsedUtId === 8) {
      setRoutes(financeRoutes);
    } else if (parsedUtId === 11) {
      setRoutes(therapist);
    } else {
      console.warn("Unknown refUtId:", parsedUtId);
    }
  }, [utId]);

  const [headername, setHeadername] = useState<string | undefined>(undefined);
  console.log("headername", headername);

  const location = useLocation();

  useEffect(() => {
    const matchedRoute1 = userRoutes.find(
      (route) => route.path === location.pathname
    );

    if (matchedRoute1) {
      setHeadername(matchedRoute1.name);
    }

    const matchedRoute2 = staffRoutes.find(
      (route) => route.path === location.pathname
    );

    if (matchedRoute2) {
      setHeadername(matchedRoute2.name);
    }

    const matchedRoute3 = directorRoutes.find(
      (route) => route.path === location.pathname
    );

    if (matchedRoute3) {
      setHeadername(matchedRoute3.name);
    }
  }, [location.pathname]);

  const handleMobileNavigate = (path: string) => {
    navigate(path);
    setUserNavbarVisible(false);
  };

  return (
    <>
      <Toast ref={toast} />

<<<<<<< HEAD
      {location.pathname != "/expired" ? (
        <div>
          <div>
            {utId === "5" && isMobile ? (
              <div>
                <div className="primaryNav flex items-center">
                  <Button
                    icon="pi pi-bars"
                    style={{ background: "#f95005", border: "none" }}
                    onClick={() => setUserNavbarVisible(true)}
                  />
                  <p className="text-[#f95005]">Logged in as: Student</p>
                </div>
                {children}
              </div>
            ) : (
              <div className="main_container">
                <motion.div className="sidebar lg:w-[60px]">
                  <div className="top_section">
                    <div className="bars pr-4">
                      <IoMdMenu onClick={() => setVisible(true)} />
                    </div>
                  </div>

                  <section className="routes">
                    {routes.map((route) => (
                      <NavLink
                        to={route.path}
                        key={route.name}
                        className={({ isActive }) =>
                          isActive ? "link active" : "link"
                        }
                      >
                        <div className="icon">{route.icon}</div>
                      </NavLink>
                    ))}
                  </section>
                </motion.div>
                <main className="lg:w-[95vw] w-[85vw]">{children}</main>
              </div>
            )}
          </div>
        </div>
      ) : (
        <>
          <Expired />
        </>
      )}
      <div className="newSideBarBtn">
        <Sidebar
          visible={visible}
          onHide={() => setVisible(false)}
          style={{
            background: "#f95005",
          }}
        >
          <div className="flex flex-col justify-between h-full">
            {routes.map((route) => (
              <NavLink
                to={route.path}
                key={route.name}
                className={({ isActive }) =>
                  isActive ? "link active" : "link"
                }
              >
                <div className="sideBarRoute">
                  <div className="routePath flex icon items-center gap-2">
                    {route.icon}
                    {route.name}
                  </div>
                </div>
              </NavLink>
            ))}
          </div>
        </Sidebar>
      </div>
      <Sidebar
        visible={userMobileNavbarVisibe}
        onHide={() => setUserNavbarVisible(false)}
      >
        <div className="flex flex-col justify-between h-full">
          <ul className="list-none p-0 m-0 overflow-hidden">
            <li onClick={() => handleMobileNavigate("/users/dashboard")}>
              <a className="p-ripple flex align-items-center cursor-pointer p-3 border-round text-700 hover:surface-100 transition-duration-150 transition-colors w-full">
                <LayoutGrid size={20} />
                <span className="ml-2 font-medium">Dashboard</span>
                <Ripple />
              </a>
            </li>
            <li onClick={() => handleMobileNavigate("/users/attendance")}>
              <a className="p-ripple flex align-items-center cursor-pointer p-3 border-round text-700 hover:surface-100 transition-duration-150 transition-colors w-full">
                <ListChecks size={20} />{" "}
                <span className="ml-2 font-medium">Attendance</span>
                <Ripple />
              </a>
            </li>
            <li onClick={() => showWarn()}>
              <a className="p-ripple flex align-items-center cursor-pointer p-3 border-round text-700 hover:surface-100 transition-duration-150 transition-colors w-full">
                <LibraryBig size={20} />{" "}
                <span className="ml-2 font-medium">User Notes</span>
                <Ripple />
              </a>
            </li>
            <li onClick={() => showWarn()}>
              <a className="p-ripple flex align-items-center cursor-pointer p-3 border-round text-700 hover:surface-100 transition-duration-150 transition-colors w-full">
                <IndianRupee size={20} />{" "}
                <span className="ml-2 font-medium">Payment</span>
                <Ripple />
              </a>
            </li>
            <li onClick={() => showWarn()}>
              <a className="p-ripple flex align-items-center cursor-pointer p-3 border-round text-700 hover:surface-100 transition-duration-150 transition-colors w-full">
                <Split size={20} />{" "}
                <span className="ml-2 font-medium">Branch</span>
                <Ripple />
              </a>
            </li>

            <li onClick={() => showWarn()}>
              <a className="p-ripple flex align-items-center cursor-pointer p-3 border-round text-700 hover:surface-100 transition-duration-150 transition-colors w-full">
                <Headset size={20} />{" "}
                <span className="ml-2 font-medium">Support</span>
                <Ripple />
              </a>
            </li>
            <li onClick={() => handleMobileNavigate("/logout")}>
              <a className="p-ripple flex align-items-center cursor-pointer p-3 border-round text-700 hover:surface-100 transition-duration-150 transition-colors w-full">
                <LogOut size={20} />{" "}
                <span className="ml-2 font-medium">Logout</span>
                <Ripple />
              </a>
            </li>
          </ul>
          <div className="mt-auto">
            <Divider />
            <a
              onClick={() => handleMobileNavigate("/users/profile")}
              className="flex align-items-center cursor-pointer p-3 gap-2 border-round text-700 hover:surface-100 transition-duration-150 transition-colors p-ripple"
            >
              <User size={20} />
              <span className="font-bold">Profile</span>
            </a>
          </div>
        </div>{" "}
      </Sidebar>
=======
      {location.pathname != "/introVideo" ? (
        <>
          {location.pathname != "/expired" ? (
            <div>
              <div>
                {utId === "5" && isMobile ? (
                  <div>
                    <div className="primaryNav flex items-center">
                      <Button
                        icon="pi pi-bars"
                        style={{ background: "#f95005", border: "none" }}
                        onClick={() => setUserNavbarVisible(true)}
                      />
                      <p className="text-[#f95005]">Logged in as: Student</p>
                    </div>
                    {children}
                  </div>
                ) : (
                  <div className="main_container">
                    <motion.div className="sidebar lg:w-[60px]">
                      <div className="top_section">
                        <div className="bars pr-4">
                          <IoMdMenu onClick={() => setVisible(true)} />
                        </div>
                      </div>

                      <section className="routes">
                        {routes.map((route) => (
                          <NavLink
                            to={route.path}
                            key={route.name}
                            className={({ isActive }) =>
                              isActive ? "link active" : "link"
                            }
                          >
                            <div className="icon">{route.icon}</div>
                          </NavLink>
                        ))}
                      </section>
                    </motion.div>
                    <main className="lg:w-[95vw] w-[85vw]">{children}</main>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <>
              <Expired />
            </>
          )}
          <div className="newSideBarBtn">
            <Sidebar
              visible={visible}
              onHide={() => setVisible(false)}
              style={{
                background: "#f95005",
              }}
            >
              <div className="flex flex-col justify-between h-full">
                {routes.map((route) => (
                  <NavLink
                    to={route.path}
                    key={route.name}
                    className={({ isActive }) =>
                      isActive ? "link active" : "link"
                    }
                  >
                    <div className="sideBarRoute">
                      <div className="routePath flex icon items-center gap-2">
                        {route.icon}
                        {route.name}
                      </div>
                    </div>
                  </NavLink>
                ))}
              </div>
            </Sidebar>
          </div>
          <Sidebar
            visible={userMobileNavbarVisibe}
            onHide={() => setUserNavbarVisible(false)}
          >
            <div className="flex flex-col justify-between h-full">
              <ul className="list-none p-0 m-0 overflow-hidden">
                <li onClick={() => handleMobileNavigate("/users/dashboard")}>
                  <a className="p-ripple flex align-items-center cursor-pointer p-3 border-round text-700 hover:surface-100 transition-duration-150 transition-colors w-full">
                    <LayoutGrid size={20} />
                    <span className="ml-2 font-medium">Dashboard</span>
                    <Ripple />
                  </a>
                </li>
                <li onClick={() => handleMobileNavigate("/users/attendance")}>
                  <a className="p-ripple flex align-items-center cursor-pointer p-3 border-round text-700 hover:surface-100 transition-duration-150 transition-colors w-full">
                    <ListChecks size={20} />{" "}
                    <span className="ml-2 font-medium">Attendance</span>
                    <Ripple />
                  </a>
                </li>
                <li onClick={() => showWarn()}>
                  <a className="p-ripple flex align-items-center cursor-pointer p-3 border-round text-700 hover:surface-100 transition-duration-150 transition-colors w-full">
                    <LibraryBig size={20} />{" "}
                    <span className="ml-2 font-medium">User Notes</span>
                    <Ripple />
                  </a>
                </li>
                <li onClick={() => handleMobileNavigate("/users/payment")}>
                  <a className="p-ripple flex align-items-center cursor-pointer p-3 border-round text-700 hover:surface-100 transition-duration-150 transition-colors w-full">
                    <IndianRupee size={20} />{" "}
                    <span className="ml-2 font-medium">Payment</span>
                    <Ripple />
                  </a>
                </li>
                <li onClick={() => showWarn()}>
                  <a className="p-ripple flex align-items-center cursor-pointer p-3 border-round text-700 hover:surface-100 transition-duration-150 transition-colors w-full">
                    <Split size={20} />{" "}
                    <span className="ml-2 font-medium">Branch</span>
                    <Ripple />
                  </a>
                </li>

                <li onClick={() => showWarn()}>
                  <a className="p-ripple flex align-items-center cursor-pointer p-3 border-round text-700 hover:surface-100 transition-duration-150 transition-colors w-full">
                    <Headset size={20} />{" "}
                    <span className="ml-2 font-medium">Support</span>
                    <Ripple />
                  </a>
                </li>
                <li onClick={() => handleMobileNavigate("/logout")}>
                  <a className="p-ripple flex align-items-center cursor-pointer p-3 border-round text-700 hover:surface-100 transition-duration-150 transition-colors w-full">
                    <LogOut size={20} />{" "}
                    <span className="ml-2 font-medium">Logout</span>
                    <Ripple />
                  </a>
                </li>
              </ul>
              <div className="mt-auto">
                <Divider />
                <a
                  onClick={() => handleMobileNavigate("/users/profile")}
                  className="flex align-items-center cursor-pointer p-3 gap-2 border-round text-700 hover:surface-100 transition-duration-150 transition-colors p-ripple"
                >
                  <User size={20} />
                  <span className="font-bold">Profile</span>
                </a>
              </div>
            </div>{" "}
          </Sidebar>
        </>
      ) : (
        <>
          <div>
            <div className="primaryNav flex items-center">
              <Button
                icon="pi pi-arrow-left"
                label="Back"
                style={{ background: "#f95005", border: "none" }}
              />
              <p className="text-[#f95005]">Logged in as: Student</p>
            </div>
            {children}
          </div>
        </>
      )}
>>>>>>> c9d0386b317eaf99c858aaae047f1d6b9d60220f
    </>
  );
};

export default Header;
