import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { HttpAdapterHost } from '@nestjs/core';
import { isObject, omit } from 'lodash';

@Catch()
export class AllHttpExceptionsFilter implements ExceptionFilter {
  private readonly logger = new Logger(AllHttpExceptionsFilter.name);

  constructor(private readonly httpAdapterHost: HttpAdapterHost) {}

  catch(exception: HttpException, host: ArgumentsHost) {
    const { httpAdapter } = this.httpAdapterHost;
    const ctx = host.switchToHttp();
    const request: object = ctx.getRequest();
    const status =
      exception instanceof HttpException
        ? exception.getStatus()
        : HttpStatus.INTERNAL_SERVER_ERROR;

    if (!(exception instanceof HttpException)) {
      exception = new HttpException(
        exception,
        exception['status'] === 'error' ? status : exception['status'],
      );
    }

    const exceptionResponse: string | object = exception.getResponse();

    let message;

    if (isObject(exceptionResponse)) {
      omit(exceptionResponse, ['stack']);
      message = exceptionResponse['message'];
    }

    const responseBody = {
      data: null,
      error: {
        message: message ?? exceptionResponse,
        statusCode: isObject(exceptionResponse)
          ? exceptionResponse['statusCode']
          : status,
        details: {
          status,
          timestamp: `${new Date().toLocaleDateString() + ' ' + new Date().toLocaleTimeString()}`,
          path: request['url'],
          exception: exceptionResponse,
        },
      },
    };

    httpAdapter.reply(ctx.getResponse(), responseBody, status);
  }
}
