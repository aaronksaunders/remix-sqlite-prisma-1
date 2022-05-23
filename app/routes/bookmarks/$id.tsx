// bookmarks/$id.tsx
import { BookMark, PrismaClient, User } from "@prisma/client";
import { useResolvedPath } from "react-router";
import { Form, Link, useLoaderData, useParams, useTransition } from "remix";

export async function loader({ params }) {
  const prisma = new PrismaClient();

  //get the user
  const user = await prisma.user.findUnique({
    where: {
      id: parseInt(params?.id),
    },
  });
  console.log("user with id = " + params?.id + " ", user);

  // get user's bookmarks
  const usersBookmarks = await prisma.bookMark.findMany({
    where: {
      userId: parseInt(params?.id),
    },
    // include : {
    //     user : true
    // }
  });
  console.log("usersBookmarks with id = " + params?.id + " ", usersBookmarks);
  await prisma.$disconnect();
  return { bookmarks: usersBookmarks, user };
}

export async function action({ request }) {
  const form = await request.formData();

  const prisma = new PrismaClient();

  // create a bookmark
  if (request.method === "POST") {
    const bookmark = await prisma.bookMark.create({
      data: {
        text: form.get("text"),
        url: form.get("url"),
        user: {
          connect: {
            id: parseInt(form.get("id")),
          },
        },
      },
    });
    console.log("created bookmark ", bookmark);
  }

  if (request.method === "DELETE") {
    const delResponse = await prisma.bookMark.delete({
      where: {
        id: parseInt(form.get("bookmarkId")),
      },
    });
    console.log(delResponse);
  }
  await prisma.$disconnect();

  return true;
}

export default function BookMarksById() {
  const { bookmarks, user } = useLoaderData();
  const { state } = useTransition();
  const busy = state === "submitting";

  const { id } = useParams();
  const to = useResolvedPath(".")

  return (
    <div
      style={{
        fontFamily: "system-ui, sans-serif",
        lineHeight: "1.4",
        width: 600,
        margin: "auto",
      }}
    >
      <div>
        <Link to={`/`}>
          <button>HOME</button>
        </Link>
      </div>
      <h2>Manage Book Marks for {user?.username}</h2>
      <Form method="post">
        <div>
          <input name="text" placeholder="description" size={30} />
          <input name="url" placeholder="url" size={30} />
          <input type={"hidden"} value={id} name="id" />
        </div>
        <button type="submit" disabled={busy}>
          {busy ? "Creating..." : "Create New Bookmark"}
        </button>
      </Form>

      {bookmarks?.map((bookmark: BookMark) => (
        <div
          style={{ border: "1px solid grey", padding: 6, margin: 8 }}
          key={bookmark.id}
        >
          <div>{bookmark.createdAt}</div>
          <div>{bookmark.text}</div>
          <div>{bookmark.url}</div>

          <Form method="delete">
            <input type={"hidden"} value={bookmark.id} name="bookmarkId" />
            <button type="submit">DELETE</button>
          </Form>
        </div>
      ))}
    </div>
  );
}
