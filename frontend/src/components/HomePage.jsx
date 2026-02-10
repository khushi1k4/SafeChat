import React, { useEffect, useState } from "react";
import Layout from "./Layout";
import { motion } from "framer-motion";
import ChatList from "../pages/chatSection/ChatList";
import { getAllUsers } from "../services/user.service";
import useLayoutStore from "../store/LayoutStore";
import useThemeStore from "../store/themeStore";
import { useChatStore } from "../store/chatStore";

const HomePage = () => {
  const setSelectedContact = useLayoutStore((state) => state.setSelectedContact);
  const [allUsers, setAllUsers] = useState([]);
  const { theme } = useThemeStore(); // ✅ get current theme

  const getAllUser = async () => {
    try {
      const result = await getAllUsers();
      if (result.status === "success") setAllUsers(result.data);
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    getAllUser();
    useChatStore.getState().fetchConversations();
  }, []);

  return (
    <Layout>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
        className={`h-full transition-colors ${theme === "dark" ? "bg-[#0b141a]" : "bg-gray-100"}`}
      >
        <ChatList contacts={allUsers} setSelectedContact={setSelectedContact} />
      </motion.div>
    </Layout>
  );
};

export default HomePage;