import BaseEntity from "./Entity";
import {
  BeforeInsert,
  Column,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  OneToMany,
} from "typeorm";
import User from "./User";
import Post from "./Post";
import Like from "./Like";
import { Exclude, Expose } from "class-transformer";
import { makeId } from "../utils/helpers";

@Entity("comments")
export default class Comment extends BaseEntity {
  @Index()
  @Column()
  identifier: string;

  @Column()
  body: string;

  @Column()
  username: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: "username", referencedColumnName: "username" })
  user: User;

  @Column()
  postId: number;

  @ManyToOne(() => Post, (post) => post.comments, { nullable: false })
  post: Post;

  @Exclude()
  @OneToMany(() => Like, (like) => like.comment)
  likes: Like[];

  protected userLike: number;

  setUserLike(user: User) {
    const index = this.likes?.findIndex(
      (like) => like.username === user.username
    );
    this.userLike = index > -1 ? this.likes[index].value : 0;
  }

  @Expose() get likeScore(): number {
    const initialValue = 0;
    return this.likes?.reduce(
      (prevValue, currentObj) => prevValue + (currentObj.value || 0),
      initialValue
    );
  }

  @BeforeInsert()
  makeId() {
    this.identifier = makeId(8);
  }
}
