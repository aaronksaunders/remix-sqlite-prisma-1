import { PrismaClient, User } from "@prisma/client";
import { Form, Link, useLoaderData, useTransition } from "remix";

/**
 *
 * @returns get data when page is loaded
 */
export async function loader() {
  const prisma = new PrismaClient();
  const allUsers = await prisma.user.findMany();
  console.log("allUsers", allUsers);
  await prisma.$disconnect();
  return allUsers;
}

/**
 * called when I submit the form on my page
 * 
 * @param param0 
 * @returns 
 */
export async function action({ request }) {
  const form = await request.formData();

  const prisma = new PrismaClient();
  const allUsers = await prisma.user.create({
    data: { email: form.get("email"), username: form.get("username") },
  });
  await prisma.$disconnect();
  return true;
}

export default function Index() {
  const users = useLoaderData();

  const { state } = useTransition();
  const busy = state === "submitting";

  return (
    <div
      style={{
        fontFamily: "system-ui, sans-serif",
        lineHeight: "1.4",
        width: 500,
        margin: "auto",
      }}
    >
      <h2>Users and Bookmarks: Sample App Tutorial</h2>
      <h4>Remix with Prisma and SQLite</h4>

      <Form method="post">
        <div>
          <input name="email" placeholder="Email" size={30} />
        </div>
        <div>
          <input name="username" placeholder="User Name" size={30} />
        </div>
        <button type="submit" disabled={busy}>
          {busy ? "Creating..." : "Create New User"}
        </button>
      </Form>

      {users.map((user: User) => (
        <div style={{ border: "1px solid grey", padding: 6, margin: 8 }}>
          <div>{user.username}</div>
          <div>{user.email}</div>
          <div>
            <Link to={`/bookmarks/${user.id}`}>
              <button>View Details</button>
            </Link>
          </div>
        </div>
      ))}
    </div>
  );
}
