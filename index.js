import chalk from "chalk";
import gradient from "gradient-string";
import chalkAnimtion from "chalk-animation";
import figlet from "figlet";
import inquirer from "inquirer";
import { createSpinner } from "nanospinner";
import { PrismaClient } from "@prisma/client";

const sleep = () => new Promise((e) => setTimeout(e, 100));
const prisma = new PrismaClient();

const addItem = async () => {
  const title = await inquirer.prompt({
    name: "title",
    type: "input",
    message: "Enter the name of the item",
  });
  const price = await inquirer.prompt({
    name: "price",
    type: "number",
    message: "Enter the price of the item",
    default: () => 0.0,
  });
  const spinner = createSpinner("Creating new entry please wait ...").start();
  try {
    await prisma.item.create({
      data: {
        title: title.title,
        price: price.price,
      },
    });
    spinner.success({ text: "Successfully created a entry" });
  } catch (e) {
    spinner.error({
      text: `Failed to create a entry the error was due to ${e}`,
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
      text: `Failed to create a entry the error was due to ${e}`,
    });
  }
};

const deleteItem = async () => {
  const id = await inquirer.prompt({
    name: "itemId",
    type: "number",
    message: "Enter the id of the item : ",
  });
  const spinner = createSpinner("Deleting item...").start();
  try {
    await prisma.item.delete({ where: { id: id.itemId } });
    spinner.success({ text: "Item deleted successfully" });
  } catch (e) {
    spinner.error({
      text: `${e}`,
    });
  }
};

const close = async () => {
  const spinner = createSpinner("Closing your cli").start();
  await sleep();
  spinner.success({ text: `${chalk.greenBright("Successfully exited")}` });
  process.exit(1);
};

const heading = async () => {
  figlet("Inventory cli", (err, data) => {
    console.log(gradient.pastel.multiline(data));
  });
  await sleep();
  console.log(`This is a basic ${chalk.greenBright(
    "inventory"
  )} cli with some of the basic functions like ${chalk.magentaBright(
    "Add a item "
  )},${chalk.blueBright("View an item ")}, ${chalk.redBright("Delete an item ")}
    `);
};

const question = async () => {
  const choice = await inquirer.prompt({
    name: "option",
    type: "list",
    message: "Select a option to continue",
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
