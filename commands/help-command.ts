import i18n = require('i18n')
import container from '../src/ioc-config';
import { getHeart } from '../src/messages';
import { Client, Message } from 'discord.js';
import { Options, Arguments } from 'yargs-parser';
import { ServiceIdentifiers } from '../src/constants';
import { CommandRegistry, Command, Configuration } from '../src/interfaces';

export default class HelpCommand implements Command {
    name: string = 'help';
    syntax: string[] = ['help', 'help {-a|--all|*all*}', 'help [-c|--command] *command*'];
    description: string = 'Provides a detailed overview of any command registered with the bot.';
    options: Options = {
        alias: {
            command: ['-c'],
            all: ['-a']
        },
        string: ['command'],
        configuration: {
            "duplicate-arguments-array": false
        }
    };

    configuration: Configuration;

    constructor() {
        this.configuration = container.get(ServiceIdentifiers.Configuration);
    }

    run(client: Client, message: Message, args: Arguments): any {
        const commandRegistry = container.get<CommandRegistry>(ServiceIdentifiers.CommandRegistry);
        const commands = commandRegistry.getAll();
        const prefix = this.configuration.getPrefix(message.guild);
        const locale = message.author.locale || 'en';

        if (args._.length == 0 && !args['all'] && !args['command']) {
            return this.sendGeneralHelpMessage(client, message)
        }

        if(args['all'] || args._[0] === "all") {
            var helpMessage = i18n.__({phrase: "Here's a list of all of the commands I can help you with:", locale: locale}).concat('\r\n');
            commands.forEach(command => {
                helpMessage = `${helpMessage}\t•\t\**${command.name}**\:\r\n`;
                command.syntax.forEach(option => helpMessage = `${helpMessage}\t\t•\t${prefix}${option}\r\n`);
            })
            helpMessage = helpMessage.concat(i18n.__({phrase: 'You can find out more by specifying a single specific command:', locale: locale})).concat('\r\n\t')
                .concat(prefix).concat(this.syntax[2]);
            return message.reply(helpMessage);
        }
    }

    checkPermissions(_message: Message): boolean {
        return true;
    }

    private sendGeneralHelpMessage(client: Client, message: Message): Promise<Message | Message[]> {
        var helpMessage: string ;
        const prefix = this.configuration.getPrefix(message.guild);
        const locale = message.author.locale || 'en';

        if (!message.guild) {
            helpMessage = i18n.__({ phrase: "Hi! I'm %s, the pronoun role assignment robot!", locale: locale }, client.user.username);
        } else {
            helpMessage = i18n.__({ phrase: "hi! I'm %s, the pronoun role assignment robot!", locale: locale }, message.guild.members.get(client.user.id).displayName);
        }

        helpMessage = helpMessage.concat('\r\n')
            .concat(i18n.__({ phrase: 'To list all of the commands I can understand, just send %s%s to any channel I can read. Or, you can also DM me if you want!', locale: locale }, prefix, 'help --all')).concat('\r\n')
            .concat(i18n.__({ phrase: 'You can also check my documentation on %s!', locale: locale }, '<https://github.com/centurionfox/pronoun-bot>')).concat('\r\n')
            .concat(i18n.__({ phrase: 'Thanks! %s', locale: locale }, getHeart()));

        return message.reply(helpMessage);
    }
}
