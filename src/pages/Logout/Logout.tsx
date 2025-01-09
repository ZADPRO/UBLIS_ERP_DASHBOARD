import React from "react";

export const Logout = () => {
  const logout = () => {
    window.close();
  };
  React.useEffect(() => {
    logout();
  }, []);

  return null; // Or a loading spinner, or a message like "Logging out..."
};
