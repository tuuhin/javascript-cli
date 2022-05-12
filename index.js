#!/usr/bin/
import chalk from "chalk";
import gradient from "gradient-string";
import figlet from "figlet";
import inquirer from "inquirer";
import { createSpinner } from "nanospinner";
import { PrismaClient } from "@prisma/client";

const sleep = (milliseconds = 100) =>
  new Promise((e) => setTimeout(e, milliseconds));

const prisma = new PrismaClient();

const addItem = async () => {
  const title = await inquirer.prompt({
    name: "title",
    type: "input",
    message: "Enter the name of the item :",
    validate: (input) => {
      if (!input) {
        return "Item name is blank. Can't use blank over here";
      }
      return true;
    },
  });

  const price = await inquirer.prompt({
    name: "price",
    type: "number",
    message: "Enter the price of the item : ",
    validate: (input) => {
      if (typeof input != "number") {
        return "The price of the item should be a number ";
      }
      return true;
    },
  });

  const spinner = createSpinner("Creating new entry please wait ...").start();
  try {
    await prisma.item.create({
      data: {
        title: title.title,
        price: price.price,
      },
    });
    spinner.success({
      text: `${chalk.green(
        "Successfully"
      )} created a entry titled ${chalk.magentaBright(
        title.title
      )} and price ${chalk.blueBright(price.price)}`,
    });
  } catch (e) {
    spinner.error({
      text: `There was a error in creating a entry`,
    });
  }
};

const viewItems = async () => {
  const spinner = createSpinner("Loading your items...").start();
  try {
    const items = await prisma.item.findMany();
    spinner.success({ text: "Successfully loaded all the  entry" });
    console.table(items);
  } catch (e) {
    spinner.error({
      text: `${chalk.bgYellowBright("Loaded")} all the entries..`,
    });
  }
};

const deleteItem = async () => {
  const id = await inquirer.prompt({
    name: "itemId",
    type: "number",
    message: "Enter the id of the item : ",
    validate: async (input) => {
      const exists = await prisma.item.findFirst({ where: { id: input } });
      console.log(exists);
      if (!exists) {
        return `${chalk.redBright(`ID : ${input} don't exists.`)}`;
      } else {
        return true;
      }
    },
  });
  const spinner = createSpinner("Deleting item...").start();
  try {
    await prisma.item.delete({ where: { id: id.itemId } });
    spinner.success({ text: "Item deleted successfully" });
  } catch (e) {
    spinner.error({
      text: ` An operation failed because it depends on one or more records that were required but not found. Record to delete does not exist.`,
    });
  }
};

const close = async () => {
  const spinner = createSpinner("Closing your cli").start();
  prisma.$disconnect();
  spinner.success({ text: `${chalk.greenBright("Successfully exited")}` });
  process.exit(1);
};

const heading = async () => {
  figlet("INVENTORY CLI", (err, data) => {
    console.log(gradient.pastel.multiline(data));
  });
  await sleep();
  console.log(`This is a basic ${chalk.greenBright(
    "inventory"
  )} cli with some of the basic functions like ${chalk.magentaBright(
    "Add a item "
  )},${chalk.blueBright("View an item ")} , ${chalk.redBright(
    "Delete an item "
  )}
    `);
};

const question = async () => {
  const choice = await inquirer.prompt({
    name: "option",
    type: "list",
    message: "Select a option to continue",
    loop: true,
    choices: ["Add a Item", "View Items", "Delete a Item", "Quit the program"],
  });
  if (choice.option == "Add a Item") {
    await addItem();
  } else if (choice.option == "View Items") {
    await viewItems();
  } else if (choice.option == "Delete a Item") {
    await deleteItem();
  } else {
    close();
  }
};

await heading();
await question();
prisma.$disconnect();
