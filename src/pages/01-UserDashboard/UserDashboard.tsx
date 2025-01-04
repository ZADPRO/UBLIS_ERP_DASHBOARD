import { Button } from "primereact/button";
import { Ripple } from "primereact/ripple";
import { Sidebar } from "primereact/sidebar";
import React, { useState } from "react";

import {
  Headset,
  IndianRupee,
  LayoutGrid,
  LibraryBig,
  ListChecks,
  LogOut,
  Mail,
  Phone,
  Split,
  User,
} from "lucide-react";
import { Divider } from "primereact/divider";
import { Fieldset } from "primereact/fieldset";
import { AvatarGroup } from "primereact/avatargroup";
import { Avatar } from "primereact/avatar";

import coverImage from "../../assets/Dashboard/banner.jpg";
import profileImage from "../../assets/Dashboard/profile.svg";
import ProductsComingSoon from "./ProductsComingSoon";
import StaffAttendance from "../../components/03-UserAttendance/Attendance";

const UserDashboard: React.FC = () => {
  const [visible, setVisible] = useState(false);

  return (
    <div>
      <div className="primaryNav">
        <Button
          icon="pi pi-bars"
          style={{ background: "#f95005", border: "none" }}
          onClick={() => setVisible(true)}
        />
        <p className="text-[#f95005]">Logged in as: User</p>
      </div>
      <div className="userContents m-3">
        <div>
          <div className="contents">
            <div className="userProfile">
              <div className="coverImage">
                <img src={coverImage} alt="coverImage" />
              </div>
              <div className="coverContents">
                <img src={profileImage} alt="userProfile" />
                <div className="userDetails">
                  <div className="">
                    <div className="userDetPrimary mt-2 flex items-center justify-between w-full m-0">
                      <p className="username">User Name</p>
                      <p className="username">Student</p>
                    </div>
                  </div>
                  <div className="flex justify-between">
                    <p className="flex items-center gap-2">
                      <Mail />
                      Email
                    </p>
                    <p className="flex items-center gap-2">
                      {" "}
                      <Phone />
                      +91 9933994499
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="userDashboard flex lg:flex-row flex-col">
            <div className="grid-item flex-1">
              <div className="card">
                <Fieldset legend="Your Actions">
                  <div className="actions">
                    <p className="flex items-baseline">
                      <span className="mr-1">0 </span> actions left
                    </p>
                  </div>
                </Fieldset>
              </div>
            </div>
            <div className="grid-item flex-1">
              <div className="card">
                <Fieldset legend="In & Out">
                  <div className="card outToday flex justify-content-center">
                    <AvatarGroup>
                      <Avatar
                        image="https://primefaces.org/cdn/primereact/images/avatar/amyelsner.png"
                        size="large"
                        shape="circle"
                      />
                      <Avatar
                        image="https://primefaces.org/cdn/primereact/images/avatar/asiyajavayant.png"
                        size="large"
                        shape="circle"
                      />
                      <Avatar
                        image="https://primefaces.org/cdn/primereact/images/avatar/onyamalimba.png"
                        size="large"
                        shape="circle"
                      />
                      <Avatar
                        image="https://primefaces.org/cdn/primereact/images/avatar/ionibowcher.png"
                        size="large"
                        shape="circle"
                      />
                      <Avatar
                        image="https://primefaces.org/cdn/primereact/images/avatar/xuxuefeng.png"
                        size="large"
                        shape="circle"
                      />
                      <Avatar label="+2" shape="circle" size="large" />
                    </AvatarGroup>
                    <p>2 People from Instructor out today</p>
                  </div>
                </Fieldset>
              </div>
            </div>
          </div>
        </div>

        <StaffAttendance />
        <ProductsComingSoon />
      </div>
      <Sidebar visible={visible} onHide={() => setVisible(false)}>
        <div className="flex flex-col justify-between h-full">
          <ul className="list-none p-0 m-0 overflow-hidden">
            <li>
              <a className="p-ripple flex align-items-center cursor-pointer p-3 border-round text-700 hover:surface-100 transition-duration-150 transition-colors w-full">
                <LayoutGrid size={20} />
                <span className="ml-2 font-medium">Dashboard</span>
                <Ripple />
              </a>
            </li>
            <li>
              <a className="p-ripple flex align-items-center cursor-pointer p-3 border-round text-700 hover:surface-100 transition-duration-150 transition-colors w-full">
                <ListChecks size={20} />{" "}
                <span className="ml-2 font-medium">Attendance</span>
                <Ripple />
              </a>
            </li>
            <li>
              <a className="p-ripple flex align-items-center cursor-pointer p-3 border-round text-700 hover:surface-100 transition-duration-150 transition-colors w-full">
                <LibraryBig size={20} />{" "}
                <span className="ml-2 font-medium">User Notes</span>
                <Ripple />
              </a>
            </li>
            <li>
              <a className="p-ripple flex align-items-center cursor-pointer p-3 border-round text-700 hover:surface-100 transition-duration-150 transition-colors w-full">
                <IndianRupee size={20} />{" "}
                <span className="ml-2 font-medium">Payment</span>
                <Ripple />
              </a>
            </li>
            <li>
              <a className="p-ripple flex align-items-center cursor-pointer p-3 border-round text-700 hover:surface-100 transition-duration-150 transition-colors w-full">
                <Split size={20} />{" "}
                <span className="ml-2 font-medium">Branch</span>
                <Ripple />
              </a>
            </li>

            <li>
              <a className="p-ripple flex align-items-center cursor-pointer p-3 border-round text-700 hover:surface-100 transition-duration-150 transition-colors w-full">
                <Headset size={20} />{" "}
                <span className="ml-2 font-medium">Support</span>
                <Ripple />
              </a>
            </li>
            <li>
              <a className="p-ripple flex align-items-center cursor-pointer p-3 border-round text-700 hover:surface-100 transition-duration-150 transition-colors w-full">
                <LogOut size={20} />{" "}
                <span className="ml-2 font-medium">Logout</span>
                <Ripple />
              </a>
            </li>
          </ul>
          <div className="mt-auto">
            <Divider />
            <a className="flex align-items-center cursor-pointer p-3 gap-2 border-round text-700 hover:surface-100 transition-duration-150 transition-colors p-ripple">
              <User size={20} />
              <span className="font-bold">Amy Elsner</span>
            </a>
          </div>
        </div>
      </Sidebar>
    </div>
  );
};

export default UserDashboard;
