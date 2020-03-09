import React from "react";
import {
  TouchableWithoutFeedback,
  ScrollView,
  StyleSheet,
  Dimensions,
  Image,
  TouchableOpacity,
  ListView
} from "react-native";
import * as firebase from 'firebase';
import {Block, Button, Text, theme} from "galio-framework";
import { useSafeArea } from "react-native-safe-area-context";

import { Icon, Drawer as DrawerCustomItem } from "../components/";
import { Images, materialTheme } from "../constants/";

const { width } = Dimensions.get("screen");

const profile = {
  avatar: Images.Profile,
  name: "Rachel Brown",
  type: "Seller",
  plan: "Pro",
  rating: 4.8
};

function CustomDrawerContent({
  drawerPosition,
  navigation,
  profile,
  focused,
  state,
  ...rest
}) {
  const insets = useSafeArea();
  const screens = [
    "Home",
    "Woman",
    "Man",
    "Kids",
    "New Collection",
    "Profile",
    "Settings",
    "Components"
  ];
  const fbUser = firebase.auth().currentUser;
  const handleLogout = () => {
    navigation.navigate("Onboarding");
    firebase.auth().signOut();
  };
  return (
    <Block
      style={styles.container}
      forceInset={{ top: "always", horizontal: "never" }}
    >
      <Block flex={0.23} style={styles.header}>
        <TouchableWithoutFeedback
          onPress={() => navigation.navigate("Profile")}
        >
          <Block style={styles.profile}>
            <Image source={{ uri: fbUser.photoURL }} style={styles.avatar} />
            <Text h5 color={"white"}>
              {fbUser.displayName}
            </Text>
          </Block>
        </TouchableWithoutFeedback>
        <Block row>
          <Block middle style={styles.pro}>
            <Text size={16} color="white">
              {profile.plan}
            </Text>
          </Block>
          <Text size={16} style={styles.seller}>
            {profile.type}
          </Text>
          <Text size={16} color={materialTheme.COLORS.SECONDARY}>
            {profile.rating}{" "}
            <Icon name="shape-star" family="GalioExtra" size={14} />
          </Text>
        </Block>
      </Block>
      <Block flex style={{ paddingLeft: 7, paddingRight: 14 }}>
        <ScrollView
          contentContainerStyle={[
            {
              paddingTop: insets.top * 0.4,
              paddingLeft: drawerPosition === "left" ? insets.left : 0,
              paddingRight: drawerPosition === "right" ? insets.right : 0
            }
          ]}
          showsVerticalScrollIndicator={false}
        >
          {screens.map((item, index) => {
            return (
              <DrawerCustomItem
                title={item}
                key={index}
                navigation={navigation}
                focused={state.index === index ? true : false}
              />
            );
          })}
        </ScrollView>
      </Block>
      <Block flex={0.25} style={{ paddingLeft: 7, paddingRight: 14 }}>
        <TouchableOpacity
          style={{ height: 55 }}
          onPress={() => handleLogout()}
        >
          <Block
            flex
            row
            style={styles.defaultStyle}
          >
            <Block middle flex={0.1} style={{ marginRight: 28 }}>
              <Icon
                size={17}
                name="ios-log-out"
                family="ionicon"
                color={materialTheme.COLORS.MUTED}
              />
            </Block>
            <Block flex={0.9}>
              <Text size={15} color="black" style={styles.drawerTitle}>
                Sign out
              </Text>
            </Block>
          </Block>
        </TouchableOpacity>
      </Block>
      {/*<Block flex={0.25} style={{ paddingLeft: 7, paddingRight: 14 }}>
        <DrawerCustomItem
          title="Sign In"
          navigation={navigation}
          focused={state.index === 8 ? true : false}
        />
        <DrawerCustomItem
          title="Sign Up"
          navigation={navigation}
          focused={state.index === 9 ? true : false}
        />
      </Block>*/}
    </Block>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1
  },
  header: {
    backgroundColor: materialTheme.COLORS.BUTTON_COLOR_ALTERNATE,
    paddingHorizontal: 28,
    paddingBottom: theme.SIZES.BASE,
    paddingTop: theme.SIZES.BASE * 2,
    justifyContent: "center"
  },
  footer: {
    paddingHorizontal: 28,
    justifyContent: "flex-end"
  },
  profile: {
    marginBottom: theme.SIZES.BASE / 2
  },
  avatar: {
    height: 40,
    width: 40,
    borderRadius: 20,
    marginBottom: theme.SIZES.BASE
  },
  pro: {
    backgroundColor: materialTheme.COLORS.BUTTON_COLOR,
    paddingHorizontal: 6,
    marginRight: 8,
    borderRadius: 4,
    height: 19,
    width: 38
  },
  seller: {
    marginRight: 16,
    color: materialTheme.COLORS.INPUT,
  },
  defaultStyle: {
    // marginVertical: 16,
    paddingVertical: 16,
    paddingHorizontal: 16,
    marginBottom: 6,
  },
  drawerTitle: {
    // marginTop: 10,
    height: 44
  }
});

export default CustomDrawerContent;
