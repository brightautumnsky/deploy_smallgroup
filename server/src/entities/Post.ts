import { Exclude, Expose } from "class-transformer";
import {
  BeforeInsert,
  Column,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  OneToMany,
} from "typeorm";
import BaseEntity from "./Entity";
import Group from "./Group";
import User from "./User";
import Comment from "./Comment";
import Like from "./Like";
import { makeId } from "../utils/helpers";
import { slugify } from "transliteration";

@Entity("posts")
export default class Post extends BaseEntity {
  @Index()
  @Column()
  identifier: string;

  @Column()
  title: string;

  @Index()
  @Column()
  slug: string;

  @Column({ nullable: true, type: "text" })
  body: string;

  @Column()
  groupName: string;

  @Column()
  username: string;

  @ManyToOne(() => User, (user) => user.posts)
  @JoinColumn({ name: "username", referencedColumnName: "username" })
  user: User;

  @ManyToOne(() => Group, (group) => group.posts)
  @JoinColumn({ name: "groupName", referencedColumnName: "name" })
  group: Group;

  @Exclude()
  @OneToMany(() => Comment, (comment) => comment.post)
  comments: Comment[];

  @Exclude()
  @OneToMany(() => Like, (like) => like.post)
  likes: Like[];

  @Expose() get url(): string {
    return `/sg/${this.groupName}/${this.identifier}/${this.slug}`;
  }

  @Expose() get commentCount(): number {
    return this.comments?.length;
  }

  @Expose() get likeScore(): number {
    return this.likes?.reduce((num, current) => num + current.value || 0, 0);
  }

  protected userLike: number;

  setUserLike(user: User) {
    const index = this.likes?.findIndex((v) => v.username === user.username);
    this.userLike = index > -1 ? this.likes[index].value : 0;
  }

  @BeforeInsert()
  makeIdAndSlug() {
    this.identifier = makeId(7);
    this.slug = slugify(this.title);
  }
}
