import { GuildMember } from "discord.js";

export const userHasRole = (member: GuildMember, userRole: string) => {
    const role = member.roles.cache.find(role => role.name.toLowerCase() === userRole.toLowerCase())
    return Boolean(role)
}
