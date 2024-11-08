// packages/api/src/routes/test.ts
import { createRouter } from "../router";
import prisma from "../db";
const router = createRouter()
  .get("/:id", async (c) => {
    const id = c.req.param("id");
    
    const user = await prisma.user.findUnique({
      where: { 
        clerkId: id 
      }
    });

    return c.json({
      user
    });
  });

export default router;