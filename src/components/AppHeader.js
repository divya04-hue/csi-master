import {
  ResponsiveContext,
  Header,
  Nav,
  Button,
  Menu,
  Text,
  Box,
  Avatar,
} from "grommet";
import { useContext } from "react";
import { Configure, Help, Hpe, Notification, Projects } from "grommet-icons";
import Logo from "./HPE_logo.png";

const items = [
  { label: "Home", path: "/" },
  { label: "About", path: "/about" },
  { label: "Signup", path: "/signup" },
  { label: "Products", path: "/products" },
  { label: "Contact", path: "/contact" },
];

const AppHeader = () => {
  const size = useContext(ResponsiveContext);
  const items = [{ label: "Dashboard", path: "/dashboard" }];

  return (
    <Header margin={{ top: "10" }}>
      <Box flex border={{ side: "bottom", color: "border-weak" }}>
        <Box
          direction="row"
          align="start"
          pad="xsmall"
          border={{ side: "bottom", color: "border" }}
          style={{ justifyContent: "space-between", alignItems: "center" }}
        >
          <img
            src={Logo}
            alt="hpe logo"
            style={{ height: "45px", marginLeft: "6px" }}
          />

          <Box></Box>

          <Box direction="row" gap="small">
            <Button>
              <Help style={{ height: "18px" }}></Help>
            </Button>
            <Button>
              <Projects style={{ height: "18px" }}></Projects>
            </Button>
          </Box>
        </Box>
        <Box
          direction="row"
          gap="small"
          align="start"
          pad="small"
          flex
          border={{ side: "bottom", color: "border" }}
          style={{ alignItems: "center" }}
        >
          <Box direction="column" align="start">
            <Text
              color="text-strong"
              style={{ fontSize: "24px", fontWeight: "700" }}
            >
              CIS
            </Text>
          </Box>
          <Box direction="row" gap="small" align="center" justify="end" flex>
            {/* 
            <Avatar
              size="xsmall"
              style={{ width: "22px", height: "22px" }}
              a11yTitle="Avatar containing initial letters J and S when clicked an alert will pop up"
              background="#FFBC44"
            >
              JS
            </Avatar> */}
          </Box>
        </Box>
      </Box>
    </Header>
  );
};

export default AppHeader;
