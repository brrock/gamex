// packages/api/src/routes/userdata.ts
import { createRouter } from "../router";
import prisma from "../db";
import { user } from ".";

const router = createRouter()
  // this route is for getting user data and is at /api/userdata/id (the userdata bit comes from the file name)
  .get("/:id", async (c) => {
    const id = c.req.param("id");
    const user = await prisma.user.findUnique({
      where: {
        clerkId: id,
      },
    });

    return c.json({
      user,
    });
  })

export default router;
