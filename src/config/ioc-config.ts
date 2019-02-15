import "reflect-metadata";
import { Container } from 'inversify';
import { Configuration } from '../interfaces';
import { ServiceIdentifiers } from '../constants';
import ConfigurationWrapper from '../configuration-wrapper';

let container = new Container();

container.bind<Configuration>(ServiceIdentifiers.Configuration).to(ConfigurationWrapper);

export default container;
