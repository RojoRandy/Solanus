import { HttpStatus, Type, applyDecorators } from '@nestjs/common';
import {
  ApiCreatedResponse,
  ApiExtraModels,
  ApiOkResponse,
  ApiProperty,
  ApiResponse,
  ApiResponseOptions,
  ApiResponseProperty,
  getSchemaPath,
} from '@nestjs/swagger';
import {
  ExamplesObject,
  SchemaObject,
} from '@nestjs/swagger/dist/interfaces/open-api-spec.interface';
import { now } from '../utils/date';
import dayjs from 'dayjs';

export class ResponseDto {
  @ApiResponseProperty({
    type: Object,
  })
  data: object;
  @ApiResponseProperty({
    type: Boolean,
    example: 'true',
  })
  success: boolean;
  @ApiResponseProperty({
    type: [String],
    example: "['First message', 'Second message']",
  })
  message: string[];
}

export class ErrorResponseDto {
  @ApiProperty({
    default: 'DATA_NOT_FOUND',
  })
  code: string;

  @ApiProperty({
    default: 'Internal Server Error',
  })
  description: string;

  @ApiProperty({
    default: new Date().toISOString(),
  })
  timestamp: dayjs.Dayjs;

  @ApiProperty({
    default: {},
  })
  data: any;

  @ApiProperty()
  path: string;

  constructor(code: string, description: string, data?: any) {
    this.code = code;
    this.description = description;
    this.timestamp = now();
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment -- payload de error deliberadamente abierto (cualquier forma de dato de contexto)
    this.data = data;
  }
}

export class SchemaResponse<T> {
  data: T | T[];
  @ApiProperty()
  success: boolean;
  @ApiProperty()
  message: string;

  constructor(
    data: T | T[],
    message: string = 'SUCCESS',
    success: boolean = true,
  ) {
    this.data = data;
    this.message = message;
    this.success = success;
  }
}

export const ApiOkSchemaResponse = <DataDto extends Type<unknown>>(
  dataDto: DataDto,
) =>
  applyDecorators(
    ApiExtraModels(SchemaResponse, dataDto),
    ApiOkResponse({
      schema: {
        allOf: [
          { $ref: getSchemaPath(SchemaResponse) },
          {
            properties: {
              data: { $ref: getSchemaPath(dataDto) },
            },
          },
        ],
      },
    }),
  );

export const ApiCreatedSchemaResponse = <DataDto extends Type<unknown>>(
  dataDto: DataDto,
) =>
  applyDecorators(
    ApiExtraModels(SchemaResponse, dataDto),
    ApiCreatedResponse({
      schema: {
        allOf: [
          { $ref: getSchemaPath(SchemaResponse) },
          {
            properties: {
              data: { $ref: getSchemaPath(dataDto) },
            },
          },
        ],
      },
    }),
  );

export const ApiOkSchemaResponses = <DataDto extends Type<unknown>>(
  dataDto: DataDto[],
) => {
  const refs: SchemaObject[] = [];
  for (const data of dataDto) {
    refs.push({
      allOf: [
        { $ref: getSchemaPath(SchemaResponse) },
        {
          properties: {
            data: { $ref: getSchemaPath(data.name) },
          },
        },
      ],
    });
  }

  return applyDecorators(
    ApiExtraModels(SchemaResponse, ...dataDto),
    ApiOkResponse({
      schema: {
        oneOf: [...refs],
      },
    }),
  );
};

export const ApiOkSchemaArrayResponse = <DataDto extends Type<unknown>>(
  dataDto: DataDto,
) =>
  applyDecorators(
    ApiExtraModels(SchemaResponse, dataDto),
    ApiOkResponse({
      schema: {
        allOf: [
          { $ref: getSchemaPath(SchemaResponse) },
          {
            properties: {
              data: {
                type: 'array',
                items: { $ref: getSchemaPath(dataDto) },
              },
            },
          },
        ],
      },
    }),
  );

function ApiMultiResponseErrorDecorator(
  status_code: HttpStatus,
  errorResponseDto: ErrorResponseDto[],
  options?: ApiResponseOptions,
) {
  const error_examples: Record<string, ExamplesObject> = {};

  for (const errorResponse of errorResponseDto) {
    error_examples[errorResponse.code] = {
      description: errorResponse.description,
      value: {
        code: errorResponse.code,
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment -- payload de error deliberadamente abierto
        data: errorResponse.data,
        description: errorResponse.description,
        timestamp: errorResponse.timestamp,
        path: errorResponse.path,
      },
    } as ExamplesObject;
  }

  return applyDecorators(
    ApiResponse({
      ...options,
      status: status_code,
      content: {
        'application/json': {
          schema: {
            type: 'array',
            items: {
              $ref: getSchemaPath(ErrorResponseDto),
            },
          },
          examples: error_examples,
        },
      },
    }),
  );
}

export function ApiNotFoundResponseError(errorResponseDto: ErrorResponseDto[]) {
  return ApiMultiResponseErrorDecorator(
    HttpStatus.NOT_FOUND,
    errorResponseDto,
    { description: 'Entity was not found in database' },
  );
}

export function ApiBadRequestResponseError(
  errorResponseDto: ErrorResponseDto[],
  options?: ApiResponseOptions,
) {
  return ApiMultiResponseErrorDecorator(
    HttpStatus.BAD_REQUEST,
    errorResponseDto,
    options,
  );
}

export function ApiNotImplementedResponseError(
  errorResponseDto: ErrorResponseDto[],
  options?: ApiResponseOptions,
) {
  return ApiMultiResponseErrorDecorator(
    HttpStatus.NOT_IMPLEMENTED,
    errorResponseDto,
    options,
  );
}

export function ApiForbiddenResponseError(
  errorResponseDto: ErrorResponseDto[],
  options?: ApiResponseOptions,
) {
  return ApiMultiResponseErrorDecorator(
    HttpStatus.FORBIDDEN,
    errorResponseDto,
    options,
  );
}

export function ApiUnauthorizedResponseError(
  errorResponseDto: ErrorResponseDto[],
  options?: ApiResponseOptions,
) {
  return ApiMultiResponseErrorDecorator(
    HttpStatus.UNAUTHORIZED,
    errorResponseDto,
    { ...options, description: 'Token is not valid' },
  );
}

export function ApiInternalServerErrorResponseError(
  errorResponseDto?: ErrorResponseDto[],
  options?: ApiResponseOptions,
) {
  let errorResponsesDto: ErrorResponseDto[] = [];
  if (errorResponseDto) errorResponsesDto = errorResponseDto;
  errorResponsesDto.push(
    new ErrorResponseDto(
      'INTERNAL_SERVER_ERROR',
      'An unexpected error occurred',
    ),
  );

  return ApiMultiResponseErrorDecorator(
    HttpStatus.INTERNAL_SERVER_ERROR,
    errorResponsesDto,
    options,
  );
}
